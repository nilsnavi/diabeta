import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { QueryActivityDto } from './dto/query-activity.dto';

@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateActivityDto) {
    return this.activityService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: QueryActivityDto) {
    return this.activityService.findAll(user.userId, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.activityService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.activityService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.activityService.remove(user.userId, id);
  }
}