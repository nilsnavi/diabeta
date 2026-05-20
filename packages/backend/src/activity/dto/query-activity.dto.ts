import { IsEnum, IsISO8601, IsOptional } from 'class-validator';
import { ActivityType } from './create-activity.dto';

export class QueryActivityDto {
  @IsOptional()
  @IsEnum(ActivityType)
  activityType?: ActivityType;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}