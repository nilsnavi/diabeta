import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TimelineService } from './timeline.service';
import { QueryTimelineDto } from './dto/query-timeline.dto';

@Controller('timeline')
@UseGuards(JwtAuthGuard)
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  getTimeline(
    @CurrentUser('id') userId: string,
    @Query() query: QueryTimelineDto,
  ) {
    return this.timelineService.getTimeline(userId, query);
  }
}