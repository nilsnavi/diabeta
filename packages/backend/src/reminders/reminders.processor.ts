import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { REMINDERS_QUEUE } from './reminders.service';
import { ReminderType } from '@prisma/client';
import { RRule } from 'rrule';

const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  check_glucose: '🩸 Измерение глюкозы',
  basal_insulin: '💉 Базальный инсулин',
  medication: '💊 Приём лекарств',
  after_meal_glucose: '🍽️ Глюкоза после еды',
  before_sleep_glucose: '🌙 Глюкоза перед сном',
  sensor_replace: '📡 Замена сенсора',
  supplies: '📦 Пополнение расходников',
  report: '📊 Отчёт',
  custom: '🔔 Напоминание',
};

@Processor(REMINDERS_QUEUE)
export class RemindersProcessor {
  private readonly logger = new Logger(RemindersProcessor.name);
  private bot: Telegraf;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (token) {
      this.bot = new Telegraf(token);
    }
  }

  @Process('send')
  async handleSend(job: Job<{ reminderId: string }>) {
    const { reminderId } = job.data;

    const reminder = await this.prisma.reminder.findFirst({
      where: { id: reminderId, deletedAt: null },
      include: { user: true },
    });

    if (!reminder) {
      this.logger.warn(`Reminder ${reminderId} not found or deleted`);
      return;
    }

    if (!reminder.enabled) {
      this.logger.log(`Reminder ${reminderId} is disabled, skipping`);
      return;
    }

    if (reminder.user.deletedAt) {
      this.logger.log(`User for reminder ${reminderId} is deleted, skipping`);
      return;
    }

    // Send Telegram message
    const telegramId = reminder.user.telegramId;
    const label = REMINDER_TYPE_LABELS[reminder.type] ?? '🔔 Напоминание';
    const message = `${label}\n\n${reminder.title}`;

    try {
      if (this.bot) {
        await this.bot.telegram.sendMessage(telegramId.toString(), `⏰ Напоминание: ${message}`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Сделано', callback_data: `rem_done_${reminderId}` },
                { text: '⏱ Отложить на 10 мин', callback_data: `rem_snooze_${reminderId}` },
              ],
              [
                { text: '⏭ Пропустить', callback_data: `rem_skip_${reminderId}` },
                { text: '📓 Открыть дневник', callback_data: `rem_diary_${reminderId}` },
              ],
            ],
          },
        });
      } else {
        this.logger.warn('Telegram bot token not configured, skipping send');
      }
    } catch (err) {
      this.logger.error(`Failed to send Telegram message for reminder ${reminderId}: ${err.message}`);
    }

    // Calculate next run
    let nextRunAt: Date | null = null;

    if (reminder.repeatRule) {
      try {
        const rule = RRule.fromString(reminder.repeatRule);
        nextRunAt = rule.after(new Date(), false);
      } catch {
        // ignore parse errors
      }
    }

    if (!nextRunAt) {
      // Daily repeat based on time
      nextRunAt = this.nextDailyOccurrence(reminder.time, reminder.timezone);
    }

    await this.prisma.reminder.update({
      where: { id: reminderId },
      data: {
        lastSentAt: new Date(),
        nextRunAt,
      },
    });

    this.logger.log(`Reminder ${reminderId} sent, next run at ${nextRunAt.toISOString()}`);
  }

  private nextDailyOccurrence(time: string, timezone: string): Date {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);

    const nowInTz = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const candidate = new Date(nowInTz);
    candidate.setHours(hours, minutes, 0, 0);

    if (candidate <= nowInTz) {
      candidate.setDate(candidate.getDate() + 1);
    }

    const tzOffset =
      now.getTime() - new Date(now.toLocaleString('en-US', { timeZone: timezone })).getTime();

    return new Date(candidate.getTime() + tzOffset);
  }
}