import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminUsersService } from './admin-users.service';
import { AdminErrorsService } from './admin-errors.service';
import { AdminReportsService } from './admin-reports.service';
import { AdminSubscriptionsService } from './admin-subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly dashboardService: AdminDashboardService,
    private readonly usersService: AdminUsersService,
    private readonly errorsService: AdminErrorsService,
    private readonly reportsService: AdminReportsService,
    private readonly subscriptionsService: AdminSubscriptionsService,
  ) {}

  // Dashboard
  @Get('dashboard')
  getDashboard() {
    return this.dashboardService.getDashboardStats();
  }

  // Users
  @Get('users')
  getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
    );
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  // Errors
  @Get('errors')
  getErrors(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('module') module?: string,
    @Query('status') status?: string,
  ) {
    return this.errorsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      module,
      status,
    );
  }

  // Reports
  @Get('reports')
  getReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  // Subscriptions
  @Get('subscriptions')
  getSubscriptions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.subscriptionsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }
}
