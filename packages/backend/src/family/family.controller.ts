import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FamilyService } from './family.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { UpdateAccessDto } from './dto/update-access.dto';

@UseGuards(JwtAuthGuard)
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  /** Owner creates a new invite */
  @Post('invites')
  createInvite(@CurrentUser() user: any, @Body() dto: CreateInviteDto) {
    return this.familyService.createInvite(user.id, dto);
  }

  /** Owner lists all access records */
  @Get('access')
  listAccess(@CurrentUser() user: any) {
    return this.familyService.listAccess(user.id);
  }

  /** Owner updates access level or status */
  @Patch('access/:id')
  updateAccess(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateAccessDto,
  ) {
    return this.familyService.updateAccess(user.id, id, dto);
  }

  /** Owner revokes access */
  @Delete('access/:id')
  @HttpCode(HttpStatus.OK)
  revokeAccess(@CurrentUser() user: any, @Param('id') id: string) {
    return this.familyService.revokeAccess(user.id, id);
  }

  /** Relative accepts invite by token */
  @Post('invites/:token/accept')
  acceptInvite(@CurrentUser() user: any, @Param('token') token: string) {
    return this.familyService.acceptInvite(token, user.id);
  }
}