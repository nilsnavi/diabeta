import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_TARGET_MIN = 3.9;
const DEFAULT_TARGET_MAX = 10.0;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private getDateRange(
    period: string = '7d',
    from?: string,
    to?: string,
  ): DateRange {
    const endDate = to ? new Date(to) : new Date();

    if (period === 'custom' && from) {
      return { startDate: new Date(from), endDate };
    }

    const startDate = new Date(endDate);
    const days = period === '14d' ? 14 : period === '30d' ? 30 : 7;
    startDate.setDate(startDate.getDate() - days);
    return { startDate, endDate };
  }

  private async getUserTargets(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { targetGlucoseMin: true, targetGlucoseMax: true },
    });
    return {
      targetMin: user?.targetGlucoseMin ?? DEFAULT_TARGET_MIN,
      targetMax: user?.targetGlucoseMax ?? DEFAULT_TARGET_MAX,
    };
  }

  async getSummary(
    userId: string,
    period: string = '7d',
    from?: string,
    to?: string,
  ) {
    const { startDate, endDate } = this.getDateRange(period, from, to);
    const { targetMin, targetMax } = await this.getUserTargets(userId);

    const records = await this.prisma.glucoseEntry.findMany({
      where: {
        userId,
        measuredAt: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      select: { value: true },
    });

    if (records.length === 0) {
      return {
        averageGlucose: null,
        minGlucose: null,
        maxGlucose: null,
        measurementsCount: 0,
        inRangeCount: 0,
        belowRangeCount: 0,
        aboveRangeCount: 0,
        inRangePercent: null,
        belowRangePercent: null,
        aboveRangePercent: null,
      };
    }

    const values = records.map((r) => r.value);
    const total = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const inRange = values.filter((v) => v >= targetMin && v <= targetMax).length;
    const below = values.filter((v) => v < targetMin).length;
    const above = values.filter((v) => v > targetMax).length;

    return {
      averageGlucose: round1(sum / total),
      minGlucose: round1(Math.min(...values)),
      maxGlucose: round1(Math.max(...values)),
      measurementsCount: total,
      inRangeCount: inRange,
      belowRangeCount: below,
      aboveRangeCount: above,
      inRangePercent: round1((inRange / total) * 100),
      belowRangePercent: round1((below / total) * 100),
      aboveRangePercent: round1((above / total) * 100),
    };
  }

  async getGlucoseChart(
    userId: string,
    period: string = '7d',
    from?: string,
    to?: string,
  ) {
    const { startDate, endDate } = this.getDateRange(period, from, to);
    const { targetMin, targetMax } = await this.getUserTargets(userId);

    const records = await this.prisma.glucoseEntry.findMany({
      where: {
        userId,
        measuredAt: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      select: { value: true, measuredAt: true, context: true },
      orderBy: { measuredAt: 'asc' },
    });

    return {
      targetMin,
      targetMax,
      points: records.map((r) => ({
        value: round1(r.value),
        measuredAt: r.measuredAt,
        context: r.context,
      })),
    };
  }

  async getDaily(
    userId: string,
    period: string = '7d',
    from?: string,
    to?: string,
  ) {
    const { startDate, endDate } = this.getDateRange(period, from, to);
    const { targetMin, targetMax } = await this.getUserTargets(userId);

    const records = await this.prisma.glucoseEntry.findMany({
      where: {
        userId,
        measuredAt: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      select: { value: true, measuredAt: true },
      orderBy: { measuredAt: 'asc' },
    });

    const byDay = new Map<string, number[]>();
    for (const r of records) {
      const key = r.measuredAt.toISOString().slice(0, 10);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(r.value);
    }

    const days = Array.from(byDay.entries()).map(([date, values]) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const inRange = values.filter((v) => v >= targetMin && v <= targetMax).length;
      return {
        date,
        averageGlucose: round1(avg),
        minGlucose: round1(Math.min(...values)),
        maxGlucose: round1(Math.max(...values)),
        measurementsCount: values.length,
        inRangePercent: round1((inRange / values.length) * 100),
      };
    });

    return { days };
  }

  async getPatterns(
    userId: string,
    period: string = '7d',
    from?: string,
    to?: string,
  ) {
    const { startDate, endDate } = this.getDateRange(period, from, to);
    const { targetMin, targetMax } = await this.getUserTargets(userId);

    const records = await this.prisma.glucoseEntry.findMany({
      where: {
        userId,
        measuredAt: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      select: { value: true, measuredAt: true, context: true },
      orderBy: { measuredAt: 'asc' },
    });

    if (records.length === 0) {
      return { patterns: [] as { type: string; message: string }[] };
    }

    const periodDays = period === '14d' ? 14 : period === '30d' ? 30 : 7;
    const patterns: { type: string; message: string }[] = [];

    const inHours = (r: { measuredAt: Date }, h1: number, h2: number) => {
      const h = r.measuredAt.getUTCHours();
      return h >= h1 && h < h2;
    };

    const morning = records.filter((r) => inHours(r, 6, 11));
    const morningHigh = morning.filter((r) => r.value > targetMax);
    if (morning.length >= 3 && morningHigh.length / morning.length >= 0.5) {
      patterns.push({
        type: 'high_morning',
        message: `За последние ${periodDays} дней утром часто встречались значения выше вашего целевого диапазона. Это наблюдение, не медицинская рекомендация. Обсудите это с врачом.`,
      });
    }

    const evening = records.filter((r) => inHours(r, 18, 23));
    const eveningHigh = evening.filter((r) => r.value > targetMax);
    if (evening.length >= 3 && eveningHigh.length / evening.length >= 0.5) {
      patterns.push({
        type: 'high_evening',
        message: `За последние ${periodDays} дней вечером часто встречались значения выше вашего целевого диапазона. Это наблюдение, не медицинская рекомендация. Обсудите это с врачом.`,
      });
    }

    const night = records.filter((r) => inHours(r, 0, 6));
    const nightLow = night.filter((r) => r.value < targetMin);
    if (night.length >= 2 && nightLow.length / night.length >= 0.5) {
      patterns.push({
        type: 'low_night',
        message: `За последние ${periodDays} дней ночью наблюдались значения ниже вашего целевого диапазона. Это наблюдение, не медицинская рекомендация. Обсудите это с врачом.`,
      });
    }

    const afterMeal = records.filter((r) => r.context === 'AFTER_MEAL');
    const afterMealHigh = afterMeal.filter((r) => r.value > targetMax);
    if (afterMeal.length >= 3 && afterMealHigh.length / afterMeal.length >= 0.5) {
      patterns.push({
        type: 'high_after_meal',
        message: `За последние ${periodDays} дней часто наблюдалось повышение значений после еды выше целевого диапазона. Это наблюдение, не медицинская рекомендация. Обсудите это с врачом.`,
      });
    }

    const avgPerDay = records.length / periodDays;
    if (avgPerDay < 2) {
      patterns.push({
        type: 'few_measurements',
        message: `За последние ${periodDays} дней количество измерений было небольшим (в среднем ${round1(avgPerDay)} в день). Регулярные измерения помогают лучше контролировать состояние. Обсудите с врачом оптимальную частоту измерений.`,
      });
    }

    return { patterns };
  }

  async getInsulin(
    userId: string,
    period: string = '7d',
    from?: string,
    to?: string,
  ) {
    const { startDate, endDate } = this.getDateRange(period, from, to);

    const records = await this.prisma.insulinEntry.findMany({
      where: {
        userId,
        injectedAt: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      select: { units: true, injectedAt: true, insulinType: true, insulinName: true },
      orderBy: { injectedAt: 'asc' },
    });

    if (records.length === 0) {
      return {
        totalUnits: 0,
        averageUnitsPerDay: null as number | null,
        count: 0,
        byType: [] as { type: string; count: number; totalUnits: number }[],
        points: [] as { units: number; injectedAt: Date; insulinType: string; insulinName: string | null }[],
      };
    }

    const periodDays = period === '14d' ? 14 : period === '30d' ? 30 : 7;
    const totalUnits = records.reduce((s, r) => s + r.units, 0);

    const byTypeMap = new Map<string, { count: number; totalUnits: number }>();
    for (const r of records) {
      const t = r.insulinType as string;
      if (!byTypeMap.has(t)) byTypeMap.set(t, { count: 0, totalUnits: 0 });
      const entry = byTypeMap.get(t)!;
      entry.count++;
      entry.totalUnits += r.units;
    }

    return {
      totalUnits: round1(totalUnits),
      averageUnitsPerDay: round1(totalUnits / periodDays),
      count: records.length,
      byType: Array.from(byTypeMap.entries()).map(([type, v]) => ({
        type,
        count: v.count,
        totalUnits: round1(v.totalUnits),
      })),
      points: records.map((r) => ({
        units: r.units,
        injectedAt: r.injectedAt,
        insulinType: r.insulinType as string,
        insulinName: r.insulinName,
      })),
    };
  }

  async getMeals(
    userId: string,
    period: string = '7d',
    from?: string,
    to?: string,
  ) {
    const { startDate, endDate } = this.getDateRange(period, from, to);

    const records = await this.prisma.mealEntry.findMany({
      where: {
        userId,
        eatenAt: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      select: {
        mealType: true,
        carbohydrates: true,
        calories: true,
        eatenAt: true,
      },
      orderBy: { eatenAt: 'asc' },
    });

    if (records.length === 0) {
      return {
        count: 0,
        averageCarbohydratesPerMeal: null as number | null,
        averageCaloriesPerMeal: null as number | null,
        byType: [] as { type: string; count: number }[],
        points: [] as { mealType: string; carbohydrates: number | null; calories: number | null; eatenAt: Date }[],
      };
    }

    const withCarbs = records.filter((r) => r.carbohydrates != null);
    const withCals = records.filter((r) => r.calories != null);

    const avgCarbs =
      withCarbs.length > 0
        ? round1(withCarbs.reduce((s, r) => s + (r.carbohydrates ?? 0), 0) / withCarbs.length)
        : null;

    const avgCals =
      withCals.length > 0
        ? round1(withCals.reduce((s, r) => s + (r.calories ?? 0), 0) / withCals.length)
        : null;

    const byTypeMap = new Map<string, { count: number }>();
    for (const r of records) {
      const t = r.mealType as string;
      if (!byTypeMap.has(t)) byTypeMap.set(t, { count: 0 });
      byTypeMap.get(t)!.count++;
    }

    return {
      count: records.length,
      averageCarbohydratesPerMeal: avgCarbs,
      averageCaloriesPerMeal: avgCals,
      byType: Array.from(byTypeMap.entries()).map(([type, v]) => ({
        type,
        count: v.count,
      })),
      points: records.map((r) => ({
        mealType: r.mealType as string,
        carbohydrates: r.carbohydrates,
        calories: r.calories,
        eatenAt: r.eatenAt,
      })),
    };
  }
}