import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get analytics summary' })
  async getSummary(
    @Request() req,
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getSummary(req.user.userId, period, from, to);
  }

  @Get('glucose-chart')
  @ApiOperation({ summary: 'Get glucose chart data' })
  async getGlucoseChart(
    @Request() req,
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getGlucoseChart(req.user.userId, period, from, to);
  }

  @Get('patterns')
  @ApiOperation({ summary: 'Get patterns and observations' })
  async getPatterns(
    @Request() req,
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getPatterns(req.user.userId, period, from, to);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get analytics overview' })
  async getOverview(@Request() req, @Query('period') period?: string) {
    return this.analyticsService.getSummary(req.user.userId, period);
  }

  @Get('blood-sugar')
  @ApiOperation({ summary: 'Get blood sugar analytics' })
  async getBloodSugarAnalytics(@Request() req, @Query('period') period?: string) {
    return this.analyticsService.getGlucoseChart(req.user.userId, period);
  }

  @Get('insulin')
  @ApiOperation({ summary: 'Get insulin analytics' })
  async getInsulinAnalytics(@Request() req, @Query('period') period?: string) {
    return this.analyticsService.getInsulin(req.user.userId, period);
  }
}
