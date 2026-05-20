import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminUsersService } from './admin-users.service';
import { AdminErrorsService } from './admin-errors.service';
import { AdminReportsService } from './admin-reports.service';
import { AdminSubscriptionsService } from './admin-subscriptions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [
    AdminDashboardService,
    AdminUsersService,
    AdminErrorsService,
    AdminReportsService,
    AdminSubscriptionsService,
  ],
  exports: [
    AdminDashboardService,
    AdminUsersService,
    AdminErrorsService,
    AdminReportsService,
    AdminSubscriptionsService,
  ],
})
export class AdminModule {}
