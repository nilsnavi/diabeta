import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { telegramId: { equals: BigInt(search) } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          telegramId: true,
          username: true,
          firstName: true,
          lastName: true,
          diabetesType: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
        subscriptionPlan: true,
        subscriptionStatus: true,
        createdAt: true,
        updatedAt: true,
        // НЕ включаем медицинские записи по умолчанию
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, data: {
    isBlocked?: boolean;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Soft delete по запросу
    if (data.isBlocked === false && user.deletedAt) {
      // Разблокировка
      return this.prisma.user.update({
        where: { id },
        data: { deletedAt: null },
      });
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        subscriptionPlan: data.subscriptionPlan as any,
        subscriptionStatus: data.subscriptionStatus as any,
        deletedAt: data.isBlocked === true ? new Date() : undefined,
      },
    });
  }

  async softDelete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
