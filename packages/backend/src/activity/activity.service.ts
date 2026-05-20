import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { QueryActivityDto } from './dto/query-activity.dto';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateActivityDto) {
    return this.prisma.activityEntry.create({
      data: {
        userId,
        activityType: dto.activityType,
        durationMinutes: dto.durationMinutes,
        intensity: dto.intensity,
        startedAt: new Date(dto.startedAt),
        comment: dto.comment,
      },
    });
  }

  async findAll(userId: string, query: QueryActivityDto) {
    return this.prisma.activityEntry.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(query.activityType && { activityType: query.activityType }),
        ...(query.from || query.to
          ? {
              startedAt: {
                ...(query.from && { gte: new Date(query.from) }),
                ...(query.to && { lte: new Date(query.to) }),
              },
            }
          : {}),
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const entry = await this.prisma.activityEntry.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!entry) throw new NotFoundException('Activity entry not found');
    return entry;
  }

  async update(userId: string, id: string, dto: UpdateActivityDto) {
    await this.findOne(userId, id);
    return this.prisma.activityEntry.update({
      where: { id },
      data: {
        ...(dto.activityType && { activityType: dto.activityType }),
        ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes }),
        ...(dto.intensity && { intensity: dto.intensity }),
        ...(dto.startedAt && { startedAt: new Date(dto.startedAt) }),
        ...(dto.comment !== undefined && { comment: dto.comment }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.activityEntry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}