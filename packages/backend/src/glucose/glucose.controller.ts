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
import { GlucoseService } from './glucose.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateGlucoseDto } from './dto/create-glucose.dto';
import { UpdateGlucoseDto } from './dto/update-glucose.dto';
import { QueryGlucoseDto } from './dto/query-glucose.dto';

@ApiTags('glucose')
@Controller('glucose')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GlucoseController {
  constructor(private glucoseService: GlucoseService) {}

  @Post()
  @ApiOperation({ summary: 'Create glucose entry' })
  create(@CurrentUser() user: any, @Body() dto: CreateGlucoseDto) {
    return this.glucoseService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get glucose entries with pagination and filters' })
  findAll(@CurrentUser() user: any, @Query() query: QueryGlucoseDto) {
    return this.glucoseService.findAll(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get glucose entry by ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.glucoseService.findOne(user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update glucose entry' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateGlucoseDto,
  ) {
    return this.glucoseService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete glucose entry' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.glucoseService.remove(user.userId, id);
  }
}