import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BloodSugarService } from './blood-sugar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBloodSugarDto } from './dto/create-blood-sugar.dto';

@ApiTags('blood-sugar')
@Controller('blood-sugar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BloodSugarController {
  constructor(private bloodSugarService: BloodSugarService) {}

  @Post()
  @ApiOperation({ summary: 'Create blood sugar record' })
  async create(@Request() req, @Body() dto: CreateBloodSugarDto) {
    return this.bloodSugarService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get blood sugar records' })
  async findAll(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.bloodSugarService.findAll(req.user.userId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blood sugar record by ID' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.bloodSugarService.findOne(req.user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete blood sugar record' })
  async delete(@Request() req, @Param('id') id: string) {
    return this.bloodSugarService.remove(req.user.userId, id);
  }
}
