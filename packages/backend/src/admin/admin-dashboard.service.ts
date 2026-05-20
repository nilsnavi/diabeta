import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Общее количество пользователей
    const totalUsers = await this.prisma.user.count({
      where: { deletedAt: null },
    });

    // Новых пользователей сегодня
    const newUsersToday = await this.prisma.user.count({
      where: {
        createdAt: { gte: today },
        deletedAt: null,
      },
    });

    // Активных пользователей сегодня (обновляли данные сегодня)
    const activeUsersToday = await this.prisma.user.count({
      where: {
        updatedAt: { gte: today },
        deletedAt: null,
      },
    });

    // Активных пользователей за 7 дней
    const activeUsers7d = await this.prisma.user.count({
      where: {
        updatedAt: { gte: sevenDaysAgo },
        deletedAt: null,
      },
    });

    // Количество записей сахара
    const glucoseEntriesCount = await this.prisma.glucoseEntry.count({
      where: { deletedAt: null },
    });

    // Количество записей инсулина
    const insulinEntriesCount = await this.prisma.insulinEntry.count({
      where: { deletedAt: null },
    });

    // Количество отчетов
    const reportsCount = await this.prisma.report.count();

    // Premium пользователей
    const premiumUsers = await this.prisma.user.count({
      where: {
        subscriptionPlan: { in: ['BASIC', 'PREMIUM'] },
        subscriptionStatus: 'ACTIVE',
        deletedAt: null,
      },
    });

    // Ошибки за 24 часа (audit logs с ошибками)
    const errorsLast24h = await this.prisma.auditLog.count({
      where: {
        createdAt: { gte: twentyFourHoursAgo },
        action: { contains: 'error', mode: 'insensitive' },
      },
    });

    return {
      totalUsers,
      newUsersToday,
      activeUsersToday,
      activeUsers7d,
      glucoseEntriesCount,
      insulinEntriesCount,
      reportsCount,
      premiumUsers,
      errorsLast24h,
    };
  }
}
