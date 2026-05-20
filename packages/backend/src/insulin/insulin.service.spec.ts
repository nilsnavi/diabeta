import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InsulinService } from './insulin.service';
import { PrismaService } from '../prisma/prisma.service';
import { InsulinType, InjectionSite } from './dto/create-insulin.dto';

const mockEntry = {
  id: 'entry-1',
  userId: 'user-1',
  insulinType: InsulinType.RAPID,
  insulinName: 'НовоРапид',
  units: 6,
  injectedAt: new Date('2024-01-01T08:00:00Z'),
  injectionSite: InjectionSite.ABDOMEN,
  comment: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockPrisma = {
  insulinEntry: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('InsulinService', () => {
  let service: InsulinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsulinService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InsulinService>(InsulinService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return confirmation message with insulin name', async () => {
      mockPrisma.insulinEntry.create.mockResolvedValue(mockEntry);

      const result = await service.create('user-1', {
        insulinType: InsulinType.RAPID,
        insulinName: 'НовоРапид',
        units: 6,
        injectedAt: '2024-01-01T08:00:00Z',
      });

      expect(result.message).toBe('Запись сохранена: НовоРапид, 6 ед.');
      expect(result.data).toEqual(mockEntry);
    });

    it('should use insulinType when insulinName is not provided', async () => {
      const entryNoName = { ...mockEntry, insulinName: null };
      mockPrisma.insulinEntry.create.mockResolvedValue(entryNoName);

      const result = await service.create('user-1', {
        insulinType: InsulinType.RAPID,
        units: 6,
        injectedAt: '2024-01-01T08:00:00Z',
      });

      expect(result.message).toBe('Запись сохранена: rapid, 6 ед.');
    });

    it('should NOT contain any dose recommendation', async () => {
      mockPrisma.insulinEntry.create.mockResolvedValue(mockEntry);

      const result = await service.create('user-1', {
        insulinType: InsulinType.RAPID,
        insulinName: 'НовоРапид',
        units: 6,
        injectedAt: '2024-01-01T08:00:00Z',
      });

      const responseStr = JSON.stringify(result);
      expect(responseStr).not.toMatch(
        /рекоменд|recommend|suggest|следует|нужно принять|оптимальн/i,
      );
    });

    it('should store exactly the units provided by user without modification', async () => {
      const userUnits = 8.5;
      mockPrisma.insulinEntry.create.mockResolvedValue({
        ...mockEntry,
        units: userUnits,
      });

      const result = await service.create('user-1', {
        insulinType: InsulinType.RAPID,
        units: userUnits,
        injectedAt: '2024-01-01T08:00:00Z',
      });

      expect(result.data.units).toBe(userUnits);
    });

    it('should accept minimum units (0.5)', async () => {
      mockPrisma.insulinEntry.create.mockResolvedValue({
        ...mockEntry,
        insulinName: 'НовоРапид',
        units: 0.5,
      });

      const result = await service.create('user-1', {
        insulinType: InsulinType.RAPID,
        insulinName: 'НовоРапид',
        units: 0.5,
        injectedAt: '2024-01-01T08:00:00Z',
      });

      expect(result.message).toContain('0.5 ед.');
    });

    it('should accept maximum units (100)', async () => {
      mockPrisma.insulinEntry.create.mockResolvedValue({
        ...mockEntry,
        units: 100,
      });

      const result = await service.create('user-1', {
        insulinType: InsulinType.BASAL,
        units: 100,
        injectedAt: '2024-01-01T08:00:00Z',
      });

      expect(result.message).toContain('100 ед.');
    });

    it('should throw BadRequestException for negative units', async () => {
      await expect(
        service.create('user-1', {
          insulinType: InsulinType.RAPID,
          units: -1,
          injectedAt: '2024-01-01T08:00:00Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for units > 100', async () => {
      await expect(
        service.create('user-1', {
          insulinType: InsulinType.RAPID,
          units: 101,
          injectedAt: '2024-01-01T08:00:00Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return entry for its owner', async () => {
      mockPrisma.insulinEntry.findFirst.mockResolvedValue(mockEntry);
      const result = await service.findOne('user-1', 'entry-1');
      expect(result).toEqual(mockEntry);
    });

    it('should throw NotFoundException when entry does not exist', async () => {
      mockPrisma.insulinEntry.findFirst.mockResolvedValue(null);
      await expect(service.findOne('user-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when accessing another user entry', async () => {
      mockPrisma.insulinEntry.findFirst.mockResolvedValue(mockEntry);
      await expect(service.findOne('user-2', 'entry-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results for current user only', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, [mockEntry]]);

      const result = await service.findAll('user-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should calculate totalPages correctly', async () => {
      mockPrisma.$transaction.mockResolvedValue([25, []]);

      const result = await service.findAll('user-1', { page: 1, limit: 10 });

      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('remove (soft delete)', () => {
    it('should set deletedAt instead of hard-deleting', async () => {
      mockPrisma.insulinEntry.findFirst.mockResolvedValue(mockEntry);
      mockPrisma.insulinEntry.update.mockResolvedValue({
        ...mockEntry,
        deletedAt: new Date(),
      });

      const result = await service.remove('user-1', 'entry-1');

      expect(result.message).toBe('Запись удалена');
      expect(mockPrisma.insulinEntry.update).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      });
    });

    it('should not allow removing another user entry', async () => {
      mockPrisma.insulinEntry.findFirst.mockResolvedValue(mockEntry);
      await expect(service.remove('user-2', 'entry-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update entry units', async () => {
      const updated = { ...mockEntry, units: 8 };
      mockPrisma.insulinEntry.findFirst.mockResolvedValue(mockEntry);
      mockPrisma.insulinEntry.update.mockResolvedValue(updated);

      const result = await service.update('user-1', 'entry-1', { units: 8 });
      expect(result.units).toBe(8);
    });

    it('should not allow updating another user entry', async () => {
      mockPrisma.insulinEntry.findFirst.mockResolvedValue(mockEntry);
      await expect(
        service.update('user-2', 'entry-1', { units: 8 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});