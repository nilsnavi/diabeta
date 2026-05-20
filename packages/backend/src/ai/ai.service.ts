import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  classifyMessage,
  isSafeCategory,
  getSafeResponse,
  SafetyCategory,
} from './safety.classifier';

// Use require to avoid TypeScript module resolution issues with openai@4
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { OpenAI } = require('openai');

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Ты — DiaBeta, справочный ассистент для людей с диабетом.
Ты помогаешь пользователю вести дневник, объясняешь термины и помогаешь подготовить вопросы врачу.
Ты не являешься врачом, не ставишь диагнозы, не назначаешь лечение, не меняешь дозировки инсулина и препаратов.
Если пользователь спрашивает про дозировку, лечение, отмену препарата или опасные симптомы — объясни, что нужно обратиться к врачу или экстренной помощи.
Отвечай простым языком, без сложных медицинских терминов.`;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private openai: any;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  async chat(userId: string, message: string) {
    const safetyCategory: SafetyCategory = classifyMessage(message);

    // Save user message
    await this.prisma.aiChatMessage.create({
      data: { userId, role: 'user', content: message, safetyCategory },
    });

    if (!isSafeCategory(safetyCategory)) {
      const safeContent = getSafeResponse(safetyCategory);
      await this.prisma.aiChatMessage.create({
        data: { userId, role: 'assistant', content: safeContent, safetyCategory },
      });
      return { role: 'assistant', content: safeContent, safetyCategory };
    }

    // Get recent history for context (last 10 messages)
    const history = await this.prisma.aiChatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    history.reverse();

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    let assistantContent: string;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      assistantContent =
        completion.choices[0]?.message?.content ??
        'Извините, не удалось получить ответ. Попробуйте позже.';
    } catch (err) {
      this.logger.error('OpenAI error', err);
      assistantContent =
        'Сервис временно недоступен. Пожалуйста, попробуйте позже.';
    }

    await this.prisma.aiChatMessage.create({
      data: { userId, role: 'assistant', content: assistantContent, safetyCategory },
    });

    return { role: 'assistant', content: assistantContent, safetyCategory };
  }

  async analyzeDiary(userId: string, days: number = 14) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [glucoseEntries, user] = await Promise.all([
      this.prisma.glucoseEntry.findMany({
        where: { userId, measuredAt: { gte: since }, deletedAt: null },
        orderBy: { measuredAt: 'asc' },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { targetGlucoseMin: true, targetGlucoseMax: true, glucoseUnit: true },
      }),
    ]);

    if (glucoseEntries.length === 0) {
      return {
        observation:
          `За последние ${days} дней в дневнике не найдено записей уровня глюкозы. ` +
          'Добавьте измерения, чтобы я мог помочь с наблюдениями.',
        disclaimer: 'Это наблюдение, не медицинская рекомендация.',
      };
    }

    const values = glucoseEntries.map((e) => e.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    const targetMin = user?.targetGlucoseMin ?? 4.0;
    const targetMax = user?.targetGlucoseMax ?? 10.0;

    const aboveTarget = values.filter((v) => v > targetMax).length;
    const belowTarget = values.filter((v) => v < targetMin).length;
    const inTarget = values.length - aboveTarget - belowTarget;

    const eveningHigh = glucoseEntries.filter(
      (e) => new Date(e.measuredAt).getHours() >= 18 && e.value > targetMax,
    ).length;

    const lines: string[] = [];
    lines.push(
      `За последние ${days} дней зафиксировано ${values.length} измерений уровня глюкозы.`,
    );
    lines.push(
      `Среднее значение: ${avg.toFixed(1)}, минимум: ${min.toFixed(1)}, максимум: ${max.toFixed(1)}.`,
    );
    lines.push(
      `В целевом диапазоне (${targetMin}–${targetMax}): ${inTarget} из ${values.length} измерений (${Math.round((inTarget / values.length) * 100)}%).`,
    );
    if (aboveTarget > 0) {
      lines.push(`Выше целевого диапазона: ${aboveTarget} измерений.`);
    }
    if (belowTarget > 0) {
      lines.push(`Ниже целевого диапазона: ${belowTarget} измерений.`);
    }
    if (eveningHigh > 2) {
      lines.push(
        `Вечером (после 18:00) часто встречались значения выше целевого диапазона (${eveningHigh} раз).`,
      );
    }

    lines.push(
      'Это только наблюдения, не медицинские рекомендации. Обсудите результаты с вашим врачом — рассмотрите время приёма инсулина, питание, физическую активность и целевой диапазон.',
    );

    return { observation: lines.join(' '), days, totalMeasurements: values.length };
  }

  async getHistory(userId: string) {
    return this.prisma.aiChatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        safetyCategory: true,
        createdAt: true,
      },
    });
  }

  async deleteHistory(userId: string) {
    await this.prisma.aiChatMessage.deleteMany({ where: { userId } });
    return { success: true };
  }
}