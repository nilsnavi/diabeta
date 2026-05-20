import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Res,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDataService } from './user-data.service';
import { AuditLogService } from './audit-log.service';

@ApiTags('user-data')
@Controller('user-data')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserDataController {
  constructor(
    private readonly userDataService: UserDataService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get('export')
  @ApiOperation({ summary: 'Export all user data (GDPR)' })
  async exportData(@Request() req: any, @Res() res: Response) {
    const userId = req.user.id;

    // Логируем экспорт данных
    await this.auditLogService.log({
      userId,
      action: 'user.data.export',
      entity: 'User',
      meta: { timestamp: new Date().toISOString() },
    });

    const data = await this.userDataService.exportUserData(userId);

    // Отправляем как JSON файл
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="diabeta-data-export-${userId}.json"`,
    );
    res.send(JSON.stringify(data, null, 2));
  }

  @Post('delete')
  @ApiOperation({ summary: 'Soft delete user account and all data' })
  async softDelete(@Request() req: any) {
    const userId = req.user.id;

    // Логируем удаление
    await this.auditLogService.log({
      userId,
      action: 'user.account.soft-delete',
      entity: 'User',
      meta: { timestamp: new Date().toISOString() },
    });

    await this.userDataService.softDeleteUser(userId);

    return { message: 'Account deleted successfully' };
  }

  @Delete('permanent')
  @ApiOperation({
    summary: 'Permanent delete user account (GDPR right to be forgotten)',
  })
  async hardDelete(@Request() req: any) {
    const userId = req.user.id;

    // Логируем постоянное удаление
    await this.auditLogService.log({
      userId,
      action: 'user.account.hard-delete',
      entity: 'User',
      meta: { timestamp: new Date().toISOString() },
    });

    await this.userDataService.hardDeleteUser(userId);

    return { message: 'Account permanently deleted' };
  }
}
