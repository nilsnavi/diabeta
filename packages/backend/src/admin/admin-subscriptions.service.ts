import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminSubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              telegramId: true,
            },
          },
        },
      }),
      this.prisma.subscription.count(),
    ]);

    return {
      data: subscriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
