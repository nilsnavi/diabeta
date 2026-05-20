import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

export const REPORTS_QUEUE = 'reports';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(REPORTS_QUEUE) private readonly reportsQueue: Queue,
  ) {}

  async create(userId: string, dto: CreateReportDto) {
    const report = await this.prisma.report.create({
      data: {
        userId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        format: dto.format,
        status: 'PENDING',
      },
    });

    await this.reportsQueue.add('generate', { reportId: report.id });

    return report;
  }

  async findAll(userId: string) {
    return this.prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    if (report.userId !== userId) throw new ForbiddenException();
    return report;
  }

  async remove(userId: string, id: string) {
    const report = await this.findOne(userId, id);
    if (report.fileUrl && fs.existsSync(report.fileUrl)) {
      fs.unlinkSync(report.fileUrl);
    }
    await this.prisma.report.delete({ where: { id } });
    return { deleted: true };
  }

  async getDownloadPath(userId: string, id: string): Promise<string> {
    const report = await this.findOne(userId, id);
    if (report.status !== 'COMPLETED') {
      throw new BadRequestException(
        `Report is not ready. Current status: ${report.status}`,
      );
    }
    if (!report.fileUrl || !fs.existsSync(report.fileUrl)) {
      throw new NotFoundException('Report file not found on disk');
    }
    return report.fileUrl;
  }
}