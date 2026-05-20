import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateReminderDto) {
    return this.remindersService.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.remindersService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.remindersService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.remindersService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.remindersService.remove(id, userId);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.remindersService.complete(id, userId);
  }

  @Post(':id/snooze')
  snooze(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Query('minutes') minutes?: string,
  ) {
    return this.remindersService.snooze(id, userId, minutes ? parseInt(minutes) : 15);
  }

  @Post(':id/skip')
  skip(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.remindersService.skip(id, userId);
  }
}