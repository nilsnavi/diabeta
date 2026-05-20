import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OwnershipGuard } from '../security/ownership.guard';
import { PrismaService } from '../prisma/prisma.service';

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;
  let reflector: Reflector;
  let prisma: PrismaService;

  const mockPrisma = {
    glucoseEntry: { findUnique: jest.fn() },
    insulinEntry: { findUnique: jest.fn() },
    mealEntry: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnershipGuard,
        Reflector,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    guard = module.get<OwnershipGuard>(OwnershipGuard);
    reflector = module.get<Reflector>(Reflector);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('должен разрешать доступ к своей записи', async () => {
      const context = createMockContext('123', 'entry-1');
      
      mockPrisma.glucoseEntry.findUnique.mockResolvedValue({
        id: 'entry-1',
        userId: '123',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('должен запрещать доступ к чужой записи', async () => {
      const context = createMockContext('123', 'entry-1');
      
      mockPrisma.glucoseEntry.findUnique.mockResolvedValue({
        id: 'entry-1',
        userId: '456', // другой пользователь
      });

      await expect(guard.canActivate(context)).rejects.toThrow();
    });

    it('должен разрешать доступ если запись не найдена (создание)', async () => {
      const context = createMockContext('123', null);
      
      mockPrisma.glucoseEntry.findUnique.mockResolvedValue(null);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  function createMockContext(userId: string, recordId: string | null): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { sub: userId },
          params: { id: recordId },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
      getType: () => 'http' as any,
    } as ExecutionContext;
  }
});
