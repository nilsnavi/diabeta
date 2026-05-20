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
import { InsulinService } from './insulin.service';
import { CreateInsulinDto } from './dto/create-insulin.dto';
import { UpdateInsulinDto } from './dto/update-insulin.dto';
import { QueryInsulinDto } from './dto/query-insulin.dto';

@UseGuards(JwtAuthGuard)
@Controller('insulin')
export class InsulinController {
  constructor(private readonly insulinService: InsulinService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateInsulinDto) {
    return this.insulinService.create(userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query() query: QueryInsulinDto,
  ) {
    return this.insulinService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.insulinService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInsulinDto,
  ) {
    return this.insulinService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.insulinService.remove(userId, id);
  }
}