import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  UseGuards,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AcceptLegalDto } from './dto/accept-legal.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: { userId: string }) {
    return this.usersService.getMe(user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateMe(user.userId, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Soft delete current user account' })
  @HttpCode(HttpStatus.OK)
  async deleteMe(@CurrentUser() user: { userId: string }) {
    return this.usersService.deleteMe(user.userId);
  }

  @Post('me/accept-legal')
  @ApiOperation({ summary: 'Accept legal documents (terms, privacy, health data consent)' })
  async acceptLegal(
    @CurrentUser() user: { userId: string },
    @Body() dto: AcceptLegalDto,
  ) {
    return this.usersService.acceptLegal(user.userId, dto);
  }

  @Post('me/complete-onboarding')
  @ApiOperation({ summary: 'Complete onboarding (requires accepted legal docs)' })
  async completeOnboarding(@CurrentUser() user: { userId: string }) {
    return this.usersService.completeOnboarding(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  async getUser(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }
}