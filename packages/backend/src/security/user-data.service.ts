import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';

@Injectable()
export class UserDataService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Экспортирует все данные пользователя в JSON формат
   */
  async exportUserData(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        languageCode: true,
        timezone: true,
        diabetesType: true,
        glucoseUnit: true,
        targetGlucoseMin: true,
        targetGlucoseMax: true,
        carbsPerBreadUnit: true,
        usesInsulin: true,
        usesMedications: true,
        usesCgm: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Получаем все связанные данные (без медицинских записей по умолчанию)
    const [
      glucoseEntries,
      insulinEntries,
      mealEntries,
      feelings,
      activities,
      reports,
      reminders,
    ] = await Promise.all([
      this.prisma.glucoseEntry.findMany({
        where: { userId },
        orderBy: { measuredAt: 'desc' },
      }),
      this.prisma.insulinEntry.findMany({
        where: { userId },
        orderBy: { injectedAt: 'desc' },
      }),
      this.prisma.mealEntry.findMany({
        where: { userId },
        orderBy: { eatenAt: 'desc' },
      }),
      this.prisma.feelingEntry.findMany({
        where: { userId },
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.activityEntry.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.report.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reminder.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      user,
      data: {
        glucoseEntries: glucoseEntries.length,
        insulinEntries: insulinEntries.length,
        mealEntries: mealEntries.length,
        feelings: feelings.length,
        activities: activities.length,
        reports: reports.length,
        reminders: reminders.length,
      },
      // Включаем полные данные только если явно запрошено
      fullData: {
        glucoseEntries,
        insulinEntries,
        mealEntries,
        feelings,
        activities,
        reports,
        reminders,
      },
    };
  }

  /**
   * Soft delete пользователя и всех его данных
   */
  async softDeleteUser(userId: string): Promise<void> {
    // Помечаем пользователя как удаленного
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    // Soft delete всех связанных записей
    await Promise.all([
      this.prisma.glucoseEntry.updateMany({
        where: { userId },
        data: { deletedAt: new Date() },
      }),
      this.prisma.insulinEntry.updateMany({
        where: { userId },
        data: { deletedAt: new Date() },
      }),
      this.prisma.mealEntry.updateMany({
        where: { userId },
        data: { deletedAt: new Date() },
      }),
      this.prisma.feelingEntry.updateMany({
        where: { userId },
        data: { deletedAt: new Date() },
      }),
      this.prisma.activityEntry.updateMany({
        where: { userId },
        data: { deletedAt: new Date() },
      }),
      this.prisma.reminder.updateMany({
        where: { userId },
        data: { isActive: false },
      }),
    ]);
  }

  /**
   * Hard delete пользователя и всех его данных (только по запросу GDPR)
   */
  async hardDeleteUser(userId: string): Promise<void> {
    // Удаляем все связанные записи
    await Promise.all([
      this.prisma.glucoseEntry.deleteMany({ where: { userId } }),
      this.prisma.insulinEntry.deleteMany({ where: { userId } }),
      this.prisma.mealEntry.deleteMany({ where: { userId } }),
      this.prisma.feelingEntry.deleteMany({ where: { userId } }),
      this.prisma.activityEntry.deleteMany({ where: { userId } }),
      this.prisma.report.deleteMany({ where: { userId } }),
      this.prisma.reminder.deleteMany({ where: { userId } }),
      this.prisma.familyAccess.deleteMany({
        OR: [{ ownerId: userId }, { relativeId: userId }],
      }),
      this.prisma.auditLog.deleteMany({ where: { userId } }),
    ]);

    // Удаляем пользователя
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
