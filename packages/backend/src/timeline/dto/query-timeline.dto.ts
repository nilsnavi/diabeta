import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export type TimelineType =
  | 'glucose'
  | 'insulin'
  | 'meal'
  | 'feeling'
  | 'activity';

export class QueryTimelineDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsIn(['glucose', 'insulin', 'meal', 'feeling', 'activity'])
  type?: TimelineType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}