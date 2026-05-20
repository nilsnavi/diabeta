import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

const USER_ID = 'user-1';
const TARGET_MIN = 4.0;
const TARGET_MAX = 10.0;

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      glucoseEntry: { findMany: jest.fn() },
      insulinEntry: { findMany: jest.fn() },
      mealEntry: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  const mockUser = () =>
    prisma.user.findUnique.mockResolvedValue({
      targetGlucoseMin: TARGET_MIN,
      targetGlucoseMax: TARGET_MAX,
    });

  // ─── getSummary ─────────────────────────────────────────────────────────────

  describe('getSummary', () => {
    it('returns empty state when no records', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([]);

      const result = await service.getSummary(USER_ID, '7d');

      expect(result.measurementsCount).toBe(0);
      expect(result.averageGlucose).toBeNull();
      expect(result.inRangePercent).toBeNull();
    });

    it('calculates averageGlucose correctly', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 5.0 },
        { value: 7.0 },
        { value: 9.0 },
      ]);

      const result = await service.getSummary(USER_ID, '7d');

      expect(result.averageGlucose).toBe(7.0);
      expect(result.measurementsCount).toBe(3);
    });

    it('calculates in/below/above range counts and percents', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 5.0 },
        { value: 9.0 },
        { value: 3.0 },
        { value: 12.0 },
      ]);

      const result = await service.getSummary(USER_ID, '7d');

      expect(result.inRangeCount).toBe(2);
      expect(result.belowRangeCount).toBe(1);
      expect(result.aboveRangeCount).toBe(1);
      expect(result.inRangePercent).toBe(50.0);
      expect(result.belowRangePercent).toBe(25.0);
      expect(result.aboveRangePercent).toBe(25.0);
    });

    it('uses default targets when user has none', async () => {
      prisma.user.findUnique.mockResolvedValue({
        targetGlucoseMin: null,
        targetGlucoseMax: null,
      });
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 5.0 },
        { value: 12.0 },
      ]);

      const result = await service.getSummary(USER_ID, '7d');
      // default min=3.9, max=10.0 → 5.0 in range, 12.0 above
      expect(result.inRangeCount).toBe(1);
      expect(result.aboveRangeCount).toBe(1);
    });

    it('rounds averageGlucose to 1 decimal', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 5.0 },
        { value: 6.0 },
        { value: 7.0 },
        { value: 8.0 },
      ]);

      const result = await service.getSummary(USER_ID, '7d');
      expect(result.averageGlucose).toBe(6.5);
    });

    it('custom period uses from/to params', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([{ value: 6.0 }]);

      await service.getSummary(USER_ID, 'custom', '2024-01-01', '2024-01-07');

      const callArg = prisma.glucoseEntry.findMany.mock.calls[0][0];
      expect(callArg.where.measuredAt.gte).toEqual(new Date('2024-01-01'));
      expect(callArg.where.measuredAt.lte).toEqual(new Date('2024-01-07'));
    });

    it('returns correct min and max', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 4.2 },
        { value: 11.3 },
        { value: 7.0 },
      ]);

      const result = await service.getSummary(USER_ID, '7d');
      expect(result.minGlucose).toBe(4.2);
      expect(result.maxGlucose).toBe(11.3);
    });

    it('all in range → 100% inRangePercent', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 5.0 },
        { value: 6.0 },
        { value: 8.0 },
      ]);

      const result = await service.getSummary(USER_ID, '7d');
      expect(result.inRangePercent).toBe(100.0);
      expect(result.belowRangePercent).toBe(0.0);
      expect(result.aboveRangePercent).toBe(0.0);
    });
  });

  // ─── getGlucoseChart ────────────────────────────────────────────────────────

  describe('getGlucoseChart', () => {
    it('returns points and target range', async () => {
      mockUser();
      const d = new Date('2024-01-10T08:00:00Z');
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 6.5, measuredAt: d, context: 'FASTING' },
      ]);

      const result = await service.getGlucoseChart(USER_ID, '7d');

      expect(result.targetMin).toBe(TARGET_MIN);
      expect(result.targetMax).toBe(TARGET_MAX);
      expect(result.points).toHaveLength(1);
      expect(result.points[0].value).toBe(6.5);
      expect(result.points[0].context).toBe('FASTING');
    });

    it('returns empty points when no data', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([]);

      const result = await service.getGlucoseChart(USER_ID, '7d');
      expect(result.points).toHaveLength(0);
    });

    it('rounds point values to 1 decimal', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 6.55, measuredAt: new Date(), context: 'OTHER' },
      ]);

      const result = await service.getGlucoseChart(USER_ID, '7d');
      expect(result.points[0].value).toBe(6.6);
    });
  });

  // ─── getDaily ───────────────────────────────────────────────────────────────

  describe('getDaily', () => {
    it('groups records by date', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 5.0, measuredAt: new Date('2024-01-08T08:00:00Z') },
        { value: 7.0, measuredAt: new Date('2024-01-08T14:00:00Z') },
        { value: 9.0, measuredAt: new Date('2024-01-09T08:00:00Z') },
      ]);

      const result = await service.getDaily(USER_ID, '7d');

      expect(result.days).toHaveLength(2);
      const day1 = result.days.find((d) => d.date === '2024-01-08');
      expect(day1).toBeDefined();
      expect(day1!.averageGlucose).toBe(6.0);
      expect(day1!.measurementsCount).toBe(2);
    });

    it('returns empty days when no data', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([]);

      const result = await service.getDaily(USER_ID, '7d');
      expect(result.days).toHaveLength(0);
    });

    it('calculates inRangePercent per day', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 5.0, measuredAt: new Date('2024-01-08T08:00:00Z') },
        { value: 15.0, measuredAt: new Date('2024-01-08T14:00:00Z') },
      ]);

      const result = await service.getDaily(USER_ID, '7d');
      expect(result.days[0].inRangePercent).toBe(50.0);
    });
  });

  // ─── getPatterns ────────────────────────────────────────────────────────────

  describe('getPatterns', () => {
    it('returns empty patterns when no records', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([]);

      const result = await service.getPatterns(USER_ID, '7d');
      expect(result.patterns).toHaveLength(0);
    });

    it('detects high morning pattern', async () => {
      mockUser();
      const morning = (day: number) => new Date(`2024-01-0${day}T07:00:00Z`);
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 12.0, measuredAt: morning(1), context: 'FASTING' },
        { value: 13.0, measuredAt: morning(2), context: 'FASTING' },
        { value: 14.0, measuredAt: morning(3), context: 'FASTING' },
      ]);

      const result = await service.getPatterns(USER_ID, '7d');
      const types = result.patterns.map((p) => p.type);
      expect(types).toContain('high_morning');
    });

    it('detects high evening pattern', async () => {
      mockUser();
      const evening = (day: number) => new Date(`2024-01-0${day}T20:00:00Z`);
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 11.0, measuredAt: evening(1), context: 'AFTER_MEAL' },
        { value: 12.0, measuredAt: evening(2), context: 'AFTER_MEAL' },
        { value: 13.0, measuredAt: evening(3), context: 'AFTER_MEAL' },
      ]);

      const result = await service.getPatterns(USER_ID, '7d');
      const types = result.patterns.map((p) => p.type);
      expect(types).toContain('high_evening');
    });

    it('detects low night pattern', async () => {
      mockUser();
      const night = (day: number) => new Date(`2024-01-0${day}T02:00:00Z`);
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 3.0, measuredAt: night(1), context: 'NIGHT' },
        { value: 2.5, measuredAt: night(2), context: 'NIGHT' },
      ]);

      const result = await service.getPatterns(USER_ID, '7d');
      const types = result.patterns.map((p) => p.type);
      expect(types).toContain('low_night');
    });

    it('detects few measurements pattern', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 6.0, measuredAt: new Date('2024-01-01T08:00:00Z'), context: 'FASTING' },
        { value: 7.0, measuredAt: new Date('2024-01-03T08:00:00Z'), context: 'FASTING' },
        { value: 6.5, measuredAt: new Date('2024-01-05T08:00:00Z'), context: 'FASTING' },
      ]);

      const result = await service.getPatterns(USER_ID, '7d');
      const types = result.patterns.map((p) => p.type);
      expect(types).toContain('few_measurements');
    });

    it('detects high after meal pattern', async () => {
      mockUser();
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 12.0, measuredAt: new Date('2024-01-01T13:00:00Z'), context: 'AFTER_MEAL' },
        { value: 13.0, measuredAt: new Date('2024-01-02T13:00:00Z'), context: 'AFTER_MEAL' },
        { value: 14.0, measuredAt: new Date('2024-01-03T13:00:00Z'), context: 'AFTER_MEAL' },
      ]);

      const result = await service.getPatterns(USER_ID, '7d');
      const types = result.patterns.map((p) => p.type);
      expect(types).toContain('high_after_meal');
    });

    it('pattern messages do not contain medical prescriptions', async () => {
      mockUser();
      const evening = (day: number) => new Date(`2024-01-0${day}T20:00:00Z`);
      prisma.glucoseEntry.findMany.mockResolvedValue([
        { value: 11.0, measuredAt: evening(1), context: 'AFTER_MEAL' },
        { value: 12.0, measuredAt: evening(2), context: 'AFTER_MEAL' },
        { value: 13.0, measuredAt: evening(3), context: 'AFTER_MEAL' },
      ]);

      const result = await service.getPatterns(USER_ID, '7d');
      for (const pattern of result.patterns) {
        expect(pattern.message.toLowerCase()).not.toContain('увеличьте дозу');
        expect(pattern.message.toLowerCase()).not.toContain('уменьшите дозу');
        expect(pattern.message.toLowerCase()).not.toContain('примите');
        expect(pattern.message).toContain('врач');
      }
    });
  });

  // ─── getInsulin ─────────────────────────────────────────────────────────────

  describe('getInsulin', () => {
    it('returns empty state when no records', async () => {
      prisma.insulinEntry.findMany.mockResolvedValue([]);

      const result = await service.getInsulin(USER_ID, '7d');

      expect(result.count).toBe(0);
      expect(result.totalUnits).toBe(0);
      expect(result.averageUnitsPerDay).toBeNull();
    });

    it('calculates totals correctly', async () => {
      prisma.insulinEntry.findMany.mockResolvedValue([
        { units: 10, injectedAt: new Date(), insulinType: 'rapid', insulinName: 'NovoRapid' },
        { units: 20, injectedAt: new Date(), insulinType: 'basal', insulinName: 'Lantus' },
      ]);

      const result = await service.getInsulin(USER_ID, '7d');

      expect(result.totalUnits).toBe(30.0);
      expect(result.count).toBe(2);
    });

    it('groups by insulin type', async () => {
      prisma.insulinEntry.findMany.mockResolvedValue([
        { units: 10, injectedAt: new Date(), insulinType: 'rapid', insulinName: null },
        { units: 5, injectedAt: new Date(), insulinType: 'rapid', insulinName: null },
        { units: 20, injectedAt: new Date(), insulinType: 'basal', insulinName: null },
      ]);

      const result = await service.getInsulin(USER_ID, '7d');
      const byType = result.byType as { type: string; count: number; totalUnits: number }[];
      const rapid = byType.find((t) => t.type === 'rapid');
      expect(rapid).toBeDefined();
      expect(rapid!.count).toBe(2);
      expect(rapid!.totalUnits).toBe(15.0);
    });
  });

  // ─── getMeals ───────────────────────────────────────────────────────────────

  describe('getMeals', () => {
    it('returns empty state when no records', async () => {
      prisma.mealEntry.findMany.mockResolvedValue([]);

      const result = await service.getMeals(USER_ID, '7d');

      expect(result.count).toBe(0);
      expect(result.averageCarbohydratesPerMeal).toBeNull();
      expect(result.averageCaloriesPerMeal).toBeNull();
    });

    it('calculates averages correctly', async () => {
      prisma.mealEntry.findMany.mockResolvedValue([
        { mealType: 'BREAKFAST', carbohydrates: 40, calories: 300, eatenAt: new Date() },
        { mealType: 'LUNCH', carbohydrates: 60, calories: 500, eatenAt: new Date() },
      ]);

      const result = await service.getMeals(USER_ID, '7d');

      expect(result.count).toBe(2);
      expect(result.averageCarbohydratesPerMeal).toBe(50.0);
      expect(result.averageCaloriesPerMeal).toBe(400.0);
    });

    it('handles null carbohydrates/calories', async () => {
      prisma.mealEntry.findMany.mockResolvedValue([
        { mealType: 'SNACK', carbohydrates: null, calories: null, eatenAt: new Date() },
      ]);

      const result = await service.getMeals(USER_ID, '7d');

      expect(result.averageCarbohydratesPerMeal).toBeNull();
      expect(result.averageCaloriesPerMeal).toBeNull();
    });

    it('groups by meal type', async () => {
      prisma.mealEntry.findMany.mockResolvedValue([
        { mealType: 'BREAKFAST', carbohydrates: 40, calories: 300, eatenAt: new Date() },
        { mealType: 'BREAKFAST', carbohydrates: 50, calories: 350, eatenAt: new Date() },
        { mealType: 'LUNCH', carbohydrates: 60, calories: 500, eatenAt: new Date() },
      ]);

      const result = await service.getMeals(USER_ID, '7d');
      const byType = result.byType as { type: string; count: number }[];
      const breakfast = byType.find((t) => t.type === 'BREAKFAST');
      expect(breakfast).toBeDefined();
      expect(breakfast!.count).toBe(2);
    });
  });
});