import { Test, TestingModule } from '@nestjs/testing';
import { MealsService } from './meals.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

describe('MealsService', () => {
  let service: MealsService;
  let prisma: PrismaService;

  const mockPrisma = {
    mealEntry: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MealsService>(MealsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user-1';
    const createDto = {
      mealType: 'breakfast',
      title: 'Завтрак',
      eatenAt: new Date().toISOString(),
      foodItems: [
        { name: 'Хлеб', carbs: 12.0, proteins: 3.0, fats: 1.0, calories: 70 },
      ],
      totalCarbs: 12.0,
      totalProteins: 3.0,
      totalFats: 1.0,
      totalCalories: 70,
      comment: 'Завтрак',
    };

    it('должен создавать запись еды', async () => {
      const mockEntry = {
        id: 'entry-1',
        userId,
        eatenAt: createDto.eatenAt,
        foodItems: createDto.foodItems,
        totalCarbs: 12.0,
        createdAt: new Date(),
      };

      mockPrisma.mealEntry.create.mockResolvedValue(mockEntry);

      const result = await service.create(userId, createDto);

      expect(mockPrisma.mealEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          eatenAt: createDto.eatenAt,
          foodItems: createDto.foodItems,
        }),
      });
      expect(result).toEqual(mockEntry);
    });

    it('должен рассчитывать ХЕ (хлебные единицы)', () => {
      // 1 ХЕ = 12г углеводов
      const carbs = 24.0;
      const breadUnits = service['calculateBreadUnits'](carbs, null);
      
      expect(breadUnits).toBeCloseTo(2.0); // 24 / 12 = 2 ХЕ
    });

    it('должен рассчитывать ХЕ для нецелого значения', () => {
      const carbs = 18.0;
      const breadUnits = service['calculateBreadUnits'](carbs, null);
      
      expect(breadUnits).toBeCloseTo(1.5); // 18 / 12 = 1.5 ХЕ
    });
  });

  describe('toggleFavorite', () => {
    const userId = 'user-1';
    const mealId = 'meal-1';

    it('должен переключать статус избранного', async () => {
      const mockMeal = {
        id: mealId,
        userId,
        isFavorite: false,
      };

      mockPrisma.mealEntry.findUnique.mockResolvedValue(mockMeal);
      mockPrisma.mealEntry.update.mockResolvedValue({
        ...mockMeal,
        isFavorite: true,
      });

      const result = await service.toggleFavorite(userId, mealId);

      expect(mockPrisma.mealEntry.update).toHaveBeenCalledWith({
        where: { id: mealId },
        data: { isFavorite: true },
      });
      expect(result.isFavorite).toBe(true);
    });

    it('должен запрещать доступ к чужой еде', async () => {
      const mockMeal = {
        id: mealId,
        userId: 'other-user',
        isFavorite: false,
      };

      mockPrisma.mealEntry.findUnique.mockResolvedValue(mockMeal);

      await expect(service.toggleFavorite(userId, mealId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findFavorites', () => {
    const userId = 'user-1';

    it('должен возвращать только избранные блюда', async () => {
      const mockFavorites = [
        { id: 'meal-1', userId, isFavorite: true, name: 'Овсянка' },
        { id: 'meal-2', userId, isFavorite: true, name: 'Гречка' },
      ];

      mockPrisma.mealEntry.findMany.mockResolvedValue(mockFavorites);

      const result = await service.findFavorites(userId);

      expect(mockPrisma.mealEntry.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          isFavorite: true,
        },
      });
      expect(result).toHaveLength(2);
    });
  });
});
