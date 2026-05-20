import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryTimelineDto, TimelineType } from './dto/query-timeline.dto';

export interface TimelineItem {
  id: string;
  type: TimelineType;
  entityId: string;
  title: string;
  subtitle: string;
  value: string;
  status: string | null;
  occurredAt: Date;
}

const GLUCOSE_CONTEXT_LABELS: Record<string, string> = {
  FASTING: 'Натощак',
  BEFORE_MEAL: 'До еды',
  AFTER_MEAL: 'После еды',
  BEFORE_SLEEP: 'Перед сном',
  NIGHT: 'Ночью',
  AFTER_ACTIVITY: 'После тренировки',
  FEELING_BAD: 'Плохое самочувствие',
  OTHER: 'Другое',
};

const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: 'Завтрак',
  LUNCH: 'Обед',
  DINNER: 'Ужин',
  SNACK: 'Перекус',
  OTHER: 'Другое',
};

const FEELING_LABELS: Record<string, string> = {
  good: 'Хорошо',
  normal: 'Нормально',
  weakness: 'Слабость',
  dizzy: 'Головокружение',
  bad: 'Плохо',
  other: 'Другое',
};

const INSULIN_TYPE_LABELS: Record<string, string> = {
  rapid: 'Быстрый',
  short: 'Короткий',
  basal: 'Базальный',
  mixed: 'Смешанный',
  other: 'Другой',
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  walking: 'Ходьба',
  running: 'Бег',
  gym: 'Тренажёрный зал',
  cardio: 'Кардио',
  strength: 'Силовая',
  cycling: 'Велосипед',
  lfk: 'ЛФК',
  other: 'Другое',
};

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async getTimeline(userId: string, query: QueryTimelineDto) {
    const { from, to, type, limit = 20, offset = 0 } = query;

    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    const items: TimelineItem[] = [];

    const shouldInclude = (t: TimelineType) => !type || type === t;

    // ─── Glucose ──────────────────────────────────────────────────────────────
    if (shouldInclude('glucose')) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { targetGlucoseMin: true, targetGlucoseMax: true },
      });

      const entries = await this.prisma.glucoseEntry.findMany({
        where: {
          userId,
          deletedAt: null,
          ...(fromDate || toDate
            ? {
                measuredAt: {
                  ...(fromDate && { gte: fromDate }),
                  ...(toDate && { lte: toDate }),
                },
              }
            : {}),
        },
      });

      for (const e of entries) {
        let status: string | null = null;
        if (user) {
          if (user.targetGlucoseMin !== null && e.value < user.targetGlucoseMin)
            status = 'below_range';
          else if (
            user.targetGlucoseMax !== null &&
            e.value > user.targetGlucoseMax
          )
            status = 'above_range';
          else status = 'in_range';
        }

        items.push({
          id: `glucose-${e.id}`,
          type: 'glucose',
          entityId: e.id,
          title: 'Сахар',
          subtitle: GLUCOSE_CONTEXT_LABELS[e.context] ?? e.context,
          value: `${e.value} ммоль/л`,
          status,
          occurredAt: e.measuredAt,
        });
      }
    }

    // ─── Insulin ──────────────────────────────────────────────────────────────
    if (shouldInclude('insulin')) {
      const entries = await this.prisma.insulinEntry.findMany({
        where: {
          userId,
          deletedAt: null,
          ...(fromDate || toDate
            ? {
                injectedAt: {
                  ...(fromDate && { gte: fromDate }),
                  ...(toDate && { lte: toDate }),
                },
              }
            : {}),
        },
      });

      for (const e of entries) {
        items.push({
          id: `insulin-${e.id}`,
          type: 'insulin',
          entityId: e.id,
          title: 'Инсулин',
          subtitle:
            e.insulinName ??
            INSULIN_TYPE_LABELS[e.insulinType] ??
            e.insulinType,
          value: `${e.units} ед.`,
          status: null,
          occurredAt: e.injectedAt,
        });
      }
    }

    // ─── Meal ─────────────────────────────────────────────────────────────────
    if (shouldInclude('meal')) {
      const entries = await this.prisma.mealEntry.findMany({
        where: {
          userId,
          deletedAt: null,
          ...(fromDate || toDate
            ? {
                eatenAt: {
                  ...(fromDate && { gte: fromDate }),
                  ...(toDate && { lte: toDate }),
                },
              }
            : {}),
        },
      });

      for (const e of entries) {
        const parts: string[] = [];
        if (e.calories !== null) parts.push(`${e.calories} ккал`);
        if (e.carbohydrates !== null) parts.push(`${e.carbohydrates} г углев.`);

        items.push({
          id: `meal-${e.id}`,
          type: 'meal',
          entityId: e.id,
          title: 'Еда',
          subtitle: `${MEAL_TYPE_LABELS[e.mealType] ?? e.mealType} — ${e.name}`,
          value: parts.join(', ') || e.name,
          status: null,
          occurredAt: e.eatenAt,
        });
      }
    }

    // ─── Feeling ──────────────────────────────────────────────────────────────
    if (shouldInclude('feeling')) {
      const entries = await this.prisma.feelingEntry.findMany({
        where: {
          userId,
          deletedAt: null,
          ...(fromDate || toDate
            ? {
                recordedAt: {
                  ...(fromDate && { gte: fromDate }),
                  ...(toDate && { lte: toDate }),
                },
              }
            : {}),
        },
      });

      for (const e of entries) {
        const moodLabel =
          e.mood !== null
            ? e.mood >= 4
              ? 'Хорошо'
              : e.mood === 3
                ? 'Нормально'
                : 'Плохо'
            : 'Нет данных';
        const parts: string[] = [];
        if (e.mood !== null) parts.push(`Настроение: ${e.mood}/5`);
        if (e.energy !== null) parts.push(`Энергия: ${e.energy}/5`);
        if (e.stress !== null) parts.push(`Стресс: ${e.stress}/5`);

        items.push({
          id: `feeling-${e.id}`,
          type: 'feeling',
          entityId: e.id,
          title: 'Самочувствие',
          subtitle: moodLabel,
          value: parts.join(', ') || e.notes || 'Нет данных',
          status: null,
          occurredAt: e.recordedAt,
        });
      }
    }

    // ─── Activity ─────────────────────────────────────────────────────────────
    if (shouldInclude('activity')) {
      const entries = await this.prisma.activityEntry.findMany({
        where: {
          userId,
          deletedAt: null,
          ...(fromDate || toDate
            ? {
                startedAt: {
                  ...(fromDate && { gte: fromDate }),
                  ...(toDate && { lte: toDate }),
                },
              }
            : {}),
        },
      });

      for (const e of entries) {
        items.push({
          id: `activity-${e.id}`,
          type: 'activity',
          entityId: e.id,
          title: 'Активность',
          subtitle:
            ACTIVITY_TYPE_LABELS[e.activityType] ?? e.activityType,
          value: `${e.durationMin} мин`,
          status: null,
          occurredAt: e.startedAt,
        });
      }
    }

    // ─── Sort & paginate ──────────────────────────────────────────────────────
    items.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

    const total = items.length;
    const paginated = items.slice(offset, offset + limit);

    return {
      items: paginated,
      total,
      limit,
      offset,
    };
  }
}