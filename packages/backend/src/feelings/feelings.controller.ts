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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FeelingsService } from './feelings.service';
import { CreateFeelingDto } from './dto/create-feeling.dto';
import { UpdateFeelingDto } from './dto/update-feeling.dto';
import { QueryFeelingDto } from './dto/query-feeling.dto';

@UseGuards(JwtAuthGuard)
@Controller('feelings')
export class FeelingsController {
  constructor(private readonly feelingsService: FeelingsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateFeelingDto) {
    return this.feelingsService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: QueryFeelingDto) {
    return this.feelingsService.findAll(user.userId, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.feelingsService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateFeelingDto,
  ) {
    return this.feelingsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.feelingsService.remove(user.userId, id);
  }
}