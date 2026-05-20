import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBloodSugarDto } from './dto/create-blood-sugar.dto';

@Injectable()
export class BloodSugarService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBloodSugarDto) {
    return this.prisma.bloodSugar.create({
      data: { userId, ...dto },
    });
  }

  async findAll(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.measuredAt = {};
      if (startDate) where.measuredAt.gte = new Date(startDate);
      if (endDate) where.measuredAt.lte = new Date(endDate);
    }

    return this.prisma.bloodSugar.findMany({
      where,
      orderBy: { measuredAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const record = await this.prisma.bloodSugar.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Blood sugar record not found');
    
    // Ownership check - пользователь может видеть только свои записи
    if (record.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    
    return record;
  }

  async remove(userId: string, id: string) {
    const record = await this.prisma.bloodSugar.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Blood sugar record not found');
    if (record.userId !== userId) throw new ForbiddenException('Access denied');
    return this.prisma.bloodSugar.delete({ where: { id } });
  }

  /** @deprecated use remove() */
  async delete(id: string) {
    return this.prisma.bloodSugar.delete({ where: { id } });
  }
}
