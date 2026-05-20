import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { ReportFormat } from './dto/create-report.dto';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: PrismaService;

  const mockPrisma = {
    report: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: getQueueToken('reports'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user-1';
    const createDto = {
      startDate: new Date('2024-01-01').toISOString(),
      endDate: new Date('2024-01-07').toISOString(),
      format: ReportFormat.PDF,
    };

    it('должен создавать отчёт и добавлять в очередь', async () => {
      const mockReport = {
        id: 'report-1',
        userId,
        status: 'PENDING',
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
        format: createDto.format,
        createdAt: new Date(),
      };

      mockPrisma.report.create.mockResolvedValue(mockReport);
      mockQueue.add.mockResolvedValue({ id: 'job-1' });

      const result = await service.create(userId, createDto);

      expect(mockPrisma.report.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          status: 'PENDING',
          format: createDto.format,
        }),
      });
      expect(mockQueue.add).toHaveBeenCalledWith('generate', {
        reportId: mockReport.id,
      });
      expect(result).toEqual(mockReport);
    });
  });

  describe('findAll', () => {
    const userId = 'user-1';

    it('должен возвращать все отчёты пользователя', async () => {
      const mockReports = [
        { id: 'report-1', userId, status: 'COMPLETED' },
        { id: 'report-2', userId, status: 'PENDING' },
      ];

      mockPrisma.report.findMany.mockResolvedValue(mockReports);

      const result = await service.findAll(userId);

      expect(mockPrisma.report.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    const userId = 'user-1';
    const reportId = 'report-1';

    it('должен возвращать отчёт по ID', async () => {
      const mockReport = {
        id: reportId,
        userId,
        status: 'COMPLETED',
      };

      mockPrisma.report.findUnique.mockResolvedValue(mockReport);

      const result = await service.findOne(userId, reportId);

      expect(result).toEqual(mockReport);
    });

    it('должен выбрасывать ошибку если отчёт не найден', async () => {
      mockPrisma.report.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId, reportId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('должен запрещать доступ к чужому отчёту', async () => {
      const mockReport = {
        id: reportId,
        userId: 'other-user',
        status: 'COMPLETED',
      };

      mockPrisma.report.findUnique.mockResolvedValue(mockReport);

      await expect(service.findOne(userId, reportId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    const userId = 'user-1';
    const reportId = 'report-1';

    it('должен удалять отчёт', async () => {
      const mockReport = {
        id: reportId,
        userId,
        status: 'COMPLETED',
        fileUrl: null,
      };

      mockPrisma.report.findUnique.mockResolvedValue(mockReport);
      mockPrisma.report.delete.mockResolvedValue({ id: reportId });

      const result = await service.remove(userId, reportId);

      expect(mockPrisma.report.delete).toHaveBeenCalledWith({
        where: { id: reportId },
      });
      expect(result).toEqual({ deleted: true });
    });
  });
});
