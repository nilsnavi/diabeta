import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
            },
          },
        },
      }),
      this.prisma.report.count(),
    ]);

    return {
      data: reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
