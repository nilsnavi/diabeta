import { Test, TestingModule } from '@nestjs/testing';
import { BloodSugarService } from './blood-sugar.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockPrisma = {
  bloodSugar: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('BloodSugarService', () => {
  let service: BloodSugarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloodSugarService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BloodSugarService>(BloodSugarService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a blood sugar record', async () => {
      const dto = { value: 5.5, unit: 'MMOL_L' as const, measuredAt: new Date() };
      const userId = 'user-1';
      const expected = { id: 'bs-1', userId, ...dto };
      mockPrisma.bloodSugar.create.mockResolvedValue(expected);

      const result = await service.create(userId, dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.bloodSugar.create).toHaveBeenCalledWith({
        data: { userId, ...dto },
      });
    });
  });

  describe('findAll', () => {
    it('should return records for user', async () => {
      const records = [{ id: 'bs-1', userId: 'user-1', value: 5.5 }];
      mockPrisma.bloodSugar.findMany.mockResolvedValue(records);

      const result = await service.findAll('user-1');
      expect(result).toEqual(records);
      expect(mockPrisma.bloodSugar.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ userId: 'user-1' }) }),
      );
    });
  });

  describe('remove', () => {
    it('should delete own record', async () => {
      const record = { id: 'bs-1', userId: 'user-1' };
      mockPrisma.bloodSugar.findUnique.mockResolvedValue(record);
      mockPrisma.bloodSugar.delete.mockResolvedValue(record);

      await service.remove('user-1', 'bs-1');
      expect(mockPrisma.bloodSugar.delete).toHaveBeenCalledWith({ where: { id: 'bs-1' } });
    });

    it('should throw NotFoundException if record not found', async () => {
      mockPrisma.bloodSugar.findUnique.mockResolvedValue(null);
      await expect(service.remove('user-1', 'bs-99')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if record belongs to another user', async () => {
      mockPrisma.bloodSugar.findUnique.mockResolvedValue({ id: 'bs-1', userId: 'user-2' });
      await expect(service.remove('user-1', 'bs-1')).rejects.toThrow(ForbiddenException);
    });
  });
});