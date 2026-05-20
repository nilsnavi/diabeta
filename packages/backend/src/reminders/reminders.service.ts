import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { RRule } from 'rrule';

export const REMINDERS_QUEUE = 'reminders';

@Injectable()
export class RemindersService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(REMINDERS_QUEUE) private remindersQueue: Queue,
  ) {}

  /**
   * Calculate nextRunAt from time (HH:MM), timezone, and optional RRULE string.
   * Returns a UTC Date representing the next occurrence after `after` (default: now).
   */
  calculateNextRunAt(
    time: string,
    timezone: string,
    repeatRule?: string,
    after?: Date,
  ): Date {
    const now = after ?? new Date();

    if (repeatRule) {
      try {
        const rule = RRule.fromString(repeatRule);
        const next = rule.after(now, false);
        if (next) return next;
      } catch {
        // fall through to simple daily calculation
      }
    }

    // Simple daily: parse HH:MM in the given timezone
    return this.nextDailyOccurrence(time, timezone, now);
  }

  private nextDailyOccurrence(time: string, timezone: string, after: Date): Date {
    const [hours, minutes] = time.split(':').map(Number);

    // Build a date string for today at the given time in the timezone
    const nowInTz = new Date(
      after.toLocaleString('en-US', { timeZone: timezone }),
    );

    const candidate = new Date(nowInTz);
    candidate.setHours(hours, minutes, 0, 0);

    if (candidate <= nowInTz) {
      candidate.setDate(candidate.getDate() + 1);
    }

    // Convert back to UTC by computing the offset
    const tzOffset =
      after.getTime() - new Date(after.toLocaleString('en-US', { timeZone: timezone })).getTime();

    return new Date(candidate.getTime() + tzOffset);
  }

  async create(userId: string, dto: CreateReminderDto) {
    const timezone = dto.timezone ?? 'UTC';
    const nextRunAt = this.calculateNextRunAt(
      dto.time,
      timezone,
      dto.repeatRule,
    );

    const reminder = await this.prisma.reminder.create({
      data: {
        userId,
        type: dto.type,
        title: dto.title,
        time: dto.time,
        timezone,
        repeatRule: dto.repeatRule,
        enabled: dto.enabled ?? true,
        nextRunAt,
      },
    });

    await this.scheduleJob(reminder.id, nextRunAt);

    return {
      reminder,
      warning:
        'Уведомления Telegram могут не прийти из-за настроек телефона, интернета или самого Telegram. ' +
        'Не используйте DiaBeta как единственный критический источник медицинских уведомлений.',
    };
  }

  async findAll(userId: string) {
    return this.prisma.reminder.findMany({
      where: { userId, deletedAt: null },
      orderBy: { nextRunAt: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const reminder = await this.prisma.reminder.findFirst({
      where: { id, deletedAt: null },
    });
    if (!reminder) throw new NotFoundException('Reminder not found');
    if (reminder.userId !== userId) throw new ForbiddenException();
    return reminder;
  }

  async update(id: string, userId: string, dto: UpdateReminderDto) {
    const reminder = await this.findOne(id, userId);

    const time = dto.time ?? reminder.time;
    const timezone = dto.timezone ?? reminder.timezone;
    const repeatRule =
      dto.repeatRule !== undefined ? dto.repeatRule : reminder.repeatRule;

    const nextRunAt = this.calculateNextRunAt(time, timezone, repeatRule ?? undefined);

    const updated = await this.prisma.reminder.update({
      where: { id },
      data: {
        ...dto,
        nextRunAt,
      },
    });

    if (updated.enabled) {
      await this.scheduleJob(updated.id, nextRunAt);
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.reminder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async complete(id: string, userId: string) {
    const reminder = await this.findOne(id, userId);

    const nextRunAt = this.calculateNextRunAt(
      reminder.time,
      reminder.timezone,
      reminder.repeatRule ?? undefined,
    );

    return this.prisma.reminder.update({
      where: { id },
      data: {
        lastSentAt: new Date(),
        nextRunAt,
      },
    });
  }

  async snooze(id: string, userId: string, minutes = 15) {
    await this.findOne(id, userId);
    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);

    await this.prisma.reminder.update({
      where: { id },
      data: { nextRunAt: snoozeUntil },
    });

    await this.scheduleJob(id, snoozeUntil);

    return { snoozedUntil: snoozeUntil };
  }

  async skip(id: string, userId: string) {
    const reminder = await this.findOne(id, userId);

    // Skip current occurrence, schedule next one
    const nextRunAt = this.calculateNextRunAt(
      reminder.time,
      reminder.timezone,
      reminder.repeatRule ?? undefined,
    );

    const updated = await this.prisma.reminder.update({
      where: { id },
      data: { nextRunAt },
    });

    await this.scheduleJob(id, nextRunAt);

    return updated;
  }

  private async scheduleJob(reminderId: string, runAt: Date) {
    const delay = Math.max(0, runAt.getTime() - Date.now());
    await this.remindersQueue.add(
      'send',
      { reminderId },
      {
        delay,
        jobId: `reminder-${reminderId}`,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }
}