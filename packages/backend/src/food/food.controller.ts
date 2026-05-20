import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FoodService } from './food.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFoodDto } from './dto/create-food.dto';

@ApiTags('food')
@Controller('food')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FoodController {
  constructor(private foodService: FoodService) {}

  @Post()
  @ApiOperation({ summary: 'Create food record' })
  async create(@Request() req, @Body() dto: CreateFoodDto) {
    return this.foodService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get food records' })
  async findAll(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.foodService.findAll(req.user.userId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get food record by ID' })
  async findOne(@Param('id') id: string) {
    return this.foodService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete food record' })
  async delete(@Param('id') id: string) {
    return this.foodService.delete(id);
  }
}
