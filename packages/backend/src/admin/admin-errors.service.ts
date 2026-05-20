import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminErrorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, module?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      action: { contains: 'error', mode: 'insensitive' },
    };

    if (module) {
      where.entity = module;
    }

    if (status) {
      where.meta = {
        path: ['status'],
        equals: status,
      };
    }

    const [errors, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
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
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: errors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
