import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodDto } from './dto/create-food.dto';

@Injectable()
export class FoodService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateFoodDto) {
    return this.prisma.food.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async findAll(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.eatenAt = {};
      if (startDate) where.eatenAt.gte = new Date(startDate);
      if (endDate) where.eatenAt.lte = new Date(endDate);
    }

    return this.prisma.food.findMany({
      where,
      orderBy: { eatenAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.food.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Food record not found');
    }

    return record;
  }

  async delete(id: string) {
    return this.prisma.food.delete({
      where: { id },
    });
  }
}
