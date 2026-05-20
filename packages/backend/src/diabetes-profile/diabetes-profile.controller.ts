import { Controller, Get, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DiabetesProfileService } from './diabetes-profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDiabetesProfileDto } from './dto/create-diabetes-profile.dto';
import { UpdateDiabetesProfileDto } from './dto/update-diabetes-profile.dto';

@ApiTags('diabetes-profile')
@Controller('diabetes-profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DiabetesProfileController {
  constructor(private diabetesProfileService: DiabetesProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get diabetes profile' })
  async getProfile(@Request() req) {
    return this.diabetesProfileService.getProfile(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create diabetes profile' })
  async createProfile(@Request() req, @Body() dto: CreateDiabetesProfileDto) {
    return this.diabetesProfileService.createProfile(req.user.userId, dto);
  }

  @Put()
  @ApiOperation({ summary: 'Update diabetes profile' })
  async updateProfile(@Request() req, @Body() dto: UpdateDiabetesProfileDto) {
    return this.diabetesProfileService.updateProfile(req.user.userId, dto);
  }
}
