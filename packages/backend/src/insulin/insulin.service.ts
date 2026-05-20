import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsulinDto } from './dto/create-insulin.dto';
import { UpdateInsulinDto } from './dto/update-insulin.dto';
import { QueryInsulinDto } from './dto/query-insulin.dto';

@Injectable()
export class InsulinService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateInsulinDto) {
    const entry = await this.prisma.insulinEntry.create({
      data: {
        userId,
        insulinType: dto.insulinType,
        insulinName: dto.insulinName ?? null,
        units: dto.units,
        injectedAt: new Date(dto.injectedAt),
        injectionSite: dto.injectionSite ?? null,
        comment: dto.comment ?? null,
      },
    });

    const name = entry.insulinName ?? entry.insulinType;
    return {
      message: `Запись сохранена: ${name}, ${entry.units} ед.`,
      data: entry,
    };
  }

  async findAll(userId: string, query: QueryInsulinDto) {
    const { from, to, insulinType, page = 1, limit = 20 } = query;

    const where: Record<string, unknown> = {
      userId,
      deletedAt: null,
    };

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);
      where.injectedAt = dateFilter;
    }

    if (insulinType) {
      where.insulinType = insulinType;
    }

    const skip = (page - 1) * limit;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.insulinEntry.count({ where }),
      this.prisma.insulinEntry.findMany({
        where,
        orderBy: { injectedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const entry = await this.prisma.insulinEntry.findFirst({
      where: { id, deletedAt: null },
    });

    if (!entry) {
      throw new NotFoundException('Запись не найдена');
    }

    if (entry.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этой записи');
    }

    return entry;
  }

  async update(userId: string, id: string, dto: UpdateInsulinDto) {
    await this.findOne(userId, id);

    return this.prisma.insulinEntry.update({
      where: { id },
      data: {
        ...(dto.insulinType !== undefined && { insulinType: dto.insulinType }),
        ...(dto.insulinName !== undefined && { insulinName: dto.insulinName }),
        ...(dto.units !== undefined && { units: dto.units }),
        ...(dto.injectedAt !== undefined && {
          injectedAt: new Date(dto.injectedAt),
        }),
        ...(dto.injectionSite !== undefined && {
          injectionSite: dto.injectionSite,
        }),
        ...(dto.comment !== undefined && { comment: dto.comment }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.insulinEntry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Запись удалена' };
  }
}