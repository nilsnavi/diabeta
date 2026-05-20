import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGlucoseDto } from './dto/create-glucose.dto';
import { UpdateGlucoseDto } from './dto/update-glucose.dto';
import { QueryGlucoseDto } from './dto/query-glucose.dto';
import { GlucoseUnit } from '@prisma/client';

export type GlucoseStatus = 'below_range' | 'in_range' | 'above_range';

const STATUS_MESSAGES: Record<GlucoseStatus, string> = {
  below_range:
    'Сахар ниже вашего целевого диапазона. Следуйте своему личному плану действий при низком сахаре. При плохом самочувствии обратитесь за медицинской помощью.',
  in_range: 'Сахар в целевом диапазоне. Запись сохранена.',
  above_range:
    'Сахар выше вашего целевого диапазона. Следите за динамикой по вашему плану самоконтроля.',
};

@Injectable()
export class GlucoseService {
  constructor(private prisma: PrismaService) {}

  resolveStatus(
    value: number,
    min: number | null,
    max: number | null,
  ): GlucoseStatus {
    if (min !== null && value < min) return 'below_range';
    if (max !== null && value > max) return 'above_range';
    return 'in_range';
  }

  async create(userId: string, dto: CreateGlucoseDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { targetGlucoseMin: true, targetGlucoseMax: true },
    });

    const entry = await this.prisma.glucoseEntry.create({
      data: {
        userId,
        value: dto.value,
        unit: dto.unit ?? GlucoseUnit.MMOL_L,
        context: dto.context,
        measuredAt: new Date(dto.measuredAt),
        comment: dto.comment,
        source: dto.source,
      },
    });

    const status = this.resolveStatus(
      entry.value,
      user?.targetGlucoseMin ?? null,
      user?.targetGlucoseMax ?? null,
    );

    return {
      entry,
      status,
      message: STATUS_MESSAGES[status],
    };
  }

  async findAll(userId: string, query: QueryGlucoseDto) {
    const { from, to, context, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId, deletedAt: null };

    if (from || to) {
      where.measuredAt = {};
      if (from) where.measuredAt.gte = new Date(from);
      if (to) where.measuredAt.lte = new Date(to);
    }

    if (context) where.context = context;

    const [items, total] = await Promise.all([
      this.prisma.glucoseEntry.findMany({
        where,
        orderBy: { measuredAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.glucoseEntry.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(userId: string, id: string) {
    const entry = await this.prisma.glucoseEntry.findFirst({
      where: { id, deletedAt: null },
    });
    if (!entry) throw new NotFoundException('Glucose entry not found');
    if (entry.userId !== userId) throw new ForbiddenException('Access denied');
    return entry;
  }

  async update(userId: string, id: string, dto: UpdateGlucoseDto) {
    const entry = await this.prisma.glucoseEntry.findFirst({
      where: { id, deletedAt: null },
    });
    if (!entry) throw new NotFoundException('Glucose entry not found');
    if (entry.userId !== userId) throw new ForbiddenException('Access denied');

    const updated = await this.prisma.glucoseEntry.update({
      where: { id },
      data: {
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
        ...(dto.context !== undefined && { context: dto.context }),
        ...(dto.measuredAt !== undefined && {
          measuredAt: new Date(dto.measuredAt),
        }),
        ...(dto.comment !== undefined && { comment: dto.comment }),
        ...(dto.source !== undefined && { source: dto.source }),
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { targetGlucoseMin: true, targetGlucoseMax: true },
    });

    const status = this.resolveStatus(
      updated.value,
      user?.targetGlucoseMin ?? null,
      user?.targetGlucoseMax ?? null,
    );

    return { entry: updated, status, message: STATUS_MESSAGES[status] };
  }

  async remove(userId: string, id: string) {
    const entry = await this.prisma.glucoseEntry.findFirst({
      where: { id, deletedAt: null },
    });
    if (!entry) throw new NotFoundException('Glucose entry not found');
    if (entry.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.glucoseEntry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }
}