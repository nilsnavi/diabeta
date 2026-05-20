import { Test, TestingModule } from '@nestjs/testing';
import { GlucoseService } from './glucose.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('GlucoseService', () => {
  let service: GlucoseService;
  let prisma: PrismaService;

  const mockPrisma = {
    glucoseEntry: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlucoseService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GlucoseService>(GlucoseService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user-1';
    const createDto = {
      value: 6.5,
      measuredAt: new Date().toISOString(),
      context: 'before_meal',
      comment: 'Нормальный сахар',
    };

    it('должен создавать запись глюкозы', async () => {
      const mockEntry = {
        id: 'entry-1',
        userId,
        value: 6.5,
        measuredAt: createDto.measuredAt,
        context: createDto.context,
        comment: createDto.comment,
        createdAt: new Date(),
      };

      mockPrisma.glucoseEntry.create.mockResolvedValue(mockEntry);

      const result = await service.create(userId, createDto);

      expect(mockPrisma.glucoseEntry.create).toHaveBeenCalledWith({
        data: {
          userId,
          value: 6.5,
          measuredAt: createDto.measuredAt,
          context: createDto.context,
          comment: createDto.comment,
        },
      });
      expect(result).toEqual(mockEntry);
    });

    it('должен выбрасывать ошибку при невалидном значении сахара (< 1)', async () => {
      const invalidDto = { ...createDto, value: 0.5 };

      await expect(service.create(userId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('должен выбрасывать ошибку при невалидном значении сахара (> 33)', async () => {
      const invalidDto = { ...createDto, value: 35 };

      await expect(service.create(userId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    const userId = 'user-1';
    const entryId = 'entry-1';

    it('должен возвращать запись если она принадлежит пользователю', async () => {
      const mockEntry = {
        id: entryId,
        userId,
        value: 6.5,
        measuredAt: new Date(),
      };

      mockPrisma.glucoseEntry.findUnique.mockResolvedValue(mockEntry);

      const result = await service.findOne(userId, entryId);

      expect(result).toEqual(mockEntry);
    });

    it('должен запрещать доступ к чужой записи', async () => {
      const mockEntry = {
        id: entryId,
        userId: 'other-user',
        value: 6.5,
        measuredAt: new Date(),
      };

      mockPrisma.glucoseEntry.findUnique.mockResolvedValue(mockEntry);

      await expect(service.findOne(userId, entryId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('resolveStatus', () => {
    it('должен возвращать "below_range" для значения ниже минимума', () => {
      const status = service.resolveStatus(3.5, 4.0, 7.0);
      expect(status).toBe('below_range');
    });

    it('должен возвращать "in_range" для значения в диапазоне', () => {
      const status = service.resolveStatus(5.5, 4.0, 7.0);
      expect(status).toBe('in_range');
    });

    it('должен возвращать "above_range" для значения выше максимума', () => {
      const status = service.resolveStatus(8.5, 4.0, 7.0);
      expect(status).toBe('above_range');
    });

    it('должен возвращать "in_range" при отсутствии целевых значений', () => {
      const status = service.resolveStatus(5.5, null, null);
      expect(status).toBe('in_range');
    });
  });

});
