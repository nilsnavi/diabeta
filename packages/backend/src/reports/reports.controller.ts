import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Res,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a report generation job' })
  create(@Request() req: any, @Body() dto: CreateReportDto) {
    return this.reportsService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports for current user' })
  findAll(@Request() req: any) {
    return this.reportsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.reportsService.findOne(req.user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete report' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.reportsService.remove(req.user.userId, id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download report file' })
  async download(
    @Request() req: any,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const filePath = await this.reportsService.getDownloadPath(req.user.userId, id);
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.csv': 'text/csv',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.zip': 'application/zip',
    };
    const mime = mimeMap[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="report-${id}${ext}"`);
    res.sendFile(path.resolve(filePath));
  }
}