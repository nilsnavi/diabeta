import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MealsService } from './meals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { QueryMealDto } from './dto/query-meal.dto';

@ApiTags('meals')
@Controller('meals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MealsController {
  constructor(private mealsService: MealsService) {}

  @Post()
  @ApiOperation({ summary: 'Create meal entry' })
  create(@CurrentUser() user: any, @Body() dto: CreateMealDto) {
    return this.mealsService.create(user.userId, dto);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get favorite meals' })
  findFavorites(@CurrentUser() user: any) {
    return this.mealsService.findFavorites(user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get meal entries with pagination and filters' })
  findAll(@CurrentUser() user: any, @Query() query: QueryMealDto) {
    return this.mealsService.findAll(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meal entry by ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.mealsService.findOne(user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update meal entry' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateMealDto,
  ) {
    return this.mealsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete meal entry' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.mealsService.remove(user.userId, id);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Toggle meal as favorite' })
  toggleFavorite(@CurrentUser() user: any, @Param('id') id: string) {
    return this.mealsService.toggleFavorite(user.userId, id);
  }
}