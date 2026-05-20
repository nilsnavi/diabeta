import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { QueryMealDto } from './dto/query-meal.dto';

export const DEFAULT_CARBS_PER_BREAD_UNIT = 12;

@Injectable()
export class MealsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate bread units (XE / ХЕ) from carbs.
   * @param carbs grams of carbohydrates
   * @param carbsPerBreadUnit user's setting (grams of carbs per 1 XE); defaults to 12
   */
  calculateBreadUnits(
    carbs: number,
    carbsPerBreadUnit: number | null,
  ): number {
    const ratio = carbsPerBreadUnit ?? DEFAULT_CARBS_PER_BREAD_UNIT;
    return parseFloat((carbs / ratio).toFixed(2));
  }

  private async resolvedBreadUnits(
    dto: CreateMealDto | UpdateMealDto,
    userId: string,
  ): Promise<number | undefined> {
    if (dto.breadUnits !== undefined) return dto.breadUnits;
    if (dto.carbs !== undefined) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { carbsPerBreadUnit: true },
      });
      return this.calculateBreadUnits(
        dto.carbs,
        user?.carbsPerBreadUnit ?? null,
      );
    }
    return undefined;
  }

  async create(userId: string, dto: CreateMealDto) {
    const breadUnits = await this.resolvedBreadUnits(dto, userId);

    return this.prisma.mealEntry.create({
      data: {
        userId,
        mealType: dto.mealType,
        name: dto.title,
        carbohydrates: dto.carbs,
        breadUnits,
        calories: dto.calories,
        protein: dto.proteins,
        fat: dto.fats,
        photoUrl: dto.photoUrl,
        eatenAt: new Date(dto.eatenAt),
        notes: dto.comment,
      },
    });
  }

  async findAll(userId: string, query: QueryMealDto) {
    const { from, to, mealType, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId, deletedAt: null };

    if (from || to) {
      where.eatenAt = {};
      if (from) where.eatenAt.gte = new Date(from);
      if (to) where.eatenAt.lte = new Date(to);
    }

    if (mealType) where.mealType = mealType;

    const [items, total] = await Promise.all([
      this.prisma.mealEntry.findMany({
        where,
        orderBy: { eatenAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.mealEntry.count({ where }),
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
    const entry = await this.prisma.mealEntry.findFirst({
      where: { id, deletedAt: null },
    });
    if (!entry) throw new NotFoundException('Meal entry not found');
    if (entry.userId !== userId) throw new ForbiddenException('Access denied');
    return entry;
  }

  async update(userId: string, id: string, dto: UpdateMealDto) {
    const entry = await this.prisma.mealEntry.findFirst({
      where: { id, deletedAt: null },
    });
    if (!entry) throw new NotFoundException('Meal entry not found');
    if (entry.userId !== userId) throw new ForbiddenException('Access denied');

    const breadUnits = await this.resolvedBreadUnits(dto, userId);

    return this.prisma.mealEntry.update({
      where: { id },
      data: {
        ...(dto.mealType !== undefined && { mealType: dto.mealType }),
        ...(dto.title !== undefined && { name: dto.title }),
        ...(dto.carbs !== undefined && { carbohydrates: dto.carbs }),
        ...(breadUnits !== undefined && { breadUnits }),
        ...(dto.calories !== undefined && { calories: dto.calories }),
        ...(dto.proteins !== undefined && { protein: dto.proteins }),
        ...(dto.fats !== undefined && { fat: dto.fats }),
        ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }),
        ...(dto.eatenAt !== undefined && {
          eatenAt: new Date(dto.eatenAt),
        }),
        ...(dto.comment !== undefined && { notes: dto.comment }),
      },
    });
  }

  async remove(userId: string, id: string) {
    const entry = await this.prisma.mealEntry.findFirst({
      where: { id, deletedAt: null },
    });
    if (!entry) throw new NotFoundException('Meal entry not found');
    if (entry.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.mealEntry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  async toggleFavorite(userId: string, id: string) {
    const entry = await this.findOne(userId, id);

    const updated = await this.prisma.mealEntry.update({
      where: { id },
      data: { isFavorite: !entry.isFavorite },
    });

    return updated;
  }

  async findFavorites(userId: string) {
    return this.prisma.mealEntry.findMany({
      where: { userId, isFavorite: true, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }
}