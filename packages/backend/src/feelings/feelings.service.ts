import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeelingDto } from './dto/create-feeling.dto';
import { UpdateFeelingDto } from './dto/update-feeling.dto';
import { QueryFeelingDto } from './dto/query-feeling.dto';

@Injectable()
export class FeelingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateFeelingDto) {
    return this.prisma.feelingEntry.create({
      data: {
        userId,
        feeling: dto.feeling,
        symptoms: dto.symptoms ?? [],
        mood: dto.mood,
        energyLevel: dto.energyLevel,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
        comment: dto.comment,
      },
    });
  }

  async findAll(userId: string, query: QueryFeelingDto) {
    const { feeling, from, to, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      deletedAt: null,
    };

    if (feeling) where.feeling = feeling;
    if (from || to) {
      where.recordedAt = {};
      if (from) where.recordedAt.gte = new Date(from);
      if (to) where.recordedAt.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      this.prisma.feelingEntry.findMany({
        where,
        orderBy: { recordedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.feelingEntry.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(userId: string, id: string) {
    const entry = await this.prisma.feelingEntry.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!entry) throw new NotFoundException('Feeling entry not found');
    return entry;
  }

  async update(userId: string, id: string, dto: UpdateFeelingDto) {
    await this.findOne(userId, id);
    return this.prisma.feelingEntry.update({
      where: { id },
      data: {
        feeling: dto.feeling,
        symptoms: dto.symptoms,
        mood: dto.mood,
        energyLevel: dto.energyLevel,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : undefined,
        comment: dto.comment,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.feelingEntry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}