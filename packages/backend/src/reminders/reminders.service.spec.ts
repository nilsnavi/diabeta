import { Test, TestingModule } from '@nestjs/testing';
import { RemindersService } from './reminders.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import dayjs from 'dayjs';

describe('RemindersService', () => {
  let service: RemindersService;
  let prisma: PrismaService;

  const mockPrisma = {
    reminder: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RemindersService>(RemindersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateNextRunAt', () => {
    it('должен рассчитывать следующее время для daily reminder', () => {
      const now = dayjs('2024-01-15T10:00:00');
      const time = '14:30';
      const frequency = 'daily';

      // Note: Adjust arguments according to actual service implementation signature
      // Assuming private method access or similar logic as per reference
      const nextRunAt = (service as any).calculateNextRunAt(now, time, frequency);

      expect(nextRunAt.hour()).toBe(14);
      expect(nextRunAt.minute()).toBe(30);
    });

    it('должен рассчитывать на следующий день если время уже прошло', () => {
      const now = dayjs('2024-01-15T16:00:00');
      const time = '14:30';
      const frequency = 'daily';

      const nextRunAt = (service as any).calculateNextRunAt(now, time, frequency);

      expect(nextRunAt.date()).toBe(16); // следующий день
      expect(nextRunAt.hour()).toBe(14);
    });

    it('должен рассчитывать weekly reminder', () => {
      const now = dayjs('2024-01-15T10:00:00'); // Monday
      const time = '09:00';
      const frequency = 'weekly';
      const daysOfWeek = [1, 3, 5]; // Mon, Wed, Fri

      const nextRunAt = (service as any).calculateNextRunAt(
        now,
        time,
        frequency,
        daysOfWeek,
      );

      expect(nextRunAt.day()).toBe(1); // Monday
      expect(nextRunAt.hour()).toBe(9);
    });
  });

  describe('snooze', () => {
    const userId = 'user-1';
    const reminderId = 'reminder-1';

    it('должен откладывать напоминание на указанное время', async () => {
      const mockReminder = {
        id: reminderId,
        userId,
        snoozedUntil: null,
      };

      mockPrisma.reminder.findUnique.mockResolvedValue(mockReminder);
      mockPrisma.reminder.update.mockResolvedValue({
        ...mockReminder,
        snoozedUntil: new Date(Date.now() + 15 * 60 * 1000), // +15 min
      });

      const result = await service.snooze(userId, reminderId, 15);

      expect(mockPrisma.reminder.update).toHaveBeenCalledWith({
        where: { id: reminderId },
        data: {
          snoozedUntil: expect.any(Date),
        },
      });
      expect(result.snoozedUntil).toBeDefined();
    });

    it('должен запрещать snooze чужого напоминания', async () => {
      const mockReminder = {
        id: reminderId,
        userId: 'other-user',
      };

      mockPrisma.reminder.findUnique.mockResolvedValue(mockReminder);

      await expect(service.snooze(userId, reminderId, 15)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('complete', () => {
    const userId = 'user-1';
    const reminderId = 'reminder-1';

    it('должен отмечать напоминание как выполненное', async () => {
      const mockReminder = {
        id: reminderId,
        userId,
        completedAt: null,
      };

      mockPrisma.reminder.findUnique.mockResolvedValue(mockReminder);
      mockPrisma.reminder.update.mockResolvedValue({
        ...mockReminder,
        completedAt: new Date(),
      });

      const result = await service.complete(userId, reminderId);

      expect(mockPrisma.reminder.update).toHaveBeenCalledWith({
        where: { id: reminderId },
        data: {
          completedAt: expect.any(Date),
        },
      });
      expect(result.completedAt).toBeDefined();
    });

    it('должен запрещать complete чужого напоминания', async () => {
      const mockReminder = {
        id: reminderId,
        userId: 'other-user',
      };

      mockPrisma.reminder.findUnique.mockResolvedValue(mockReminder);

      await expect(service.complete(userId, reminderId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});