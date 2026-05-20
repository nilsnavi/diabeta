import { IsEnum, IsInt, IsISO8601, IsOptional, IsString, Max, Min } from 'class-validator';

export enum ActivityType {
  walking = 'walking',
  running = 'running',
  gym = 'gym',
  cardio = 'cardio',
  strength = 'strength',
  cycling = 'cycling',
  lfk = 'lfk',
  other = 'other',
}

export enum Intensity {
  low = 'low',
  medium = 'medium',
  high = 'high',
}

export class CreateActivityDto {
  @IsEnum(ActivityType)
  activityType: ActivityType;

  @IsInt()
  @Min(1)
  @Max(600)
  durationMinutes: number;

  @IsEnum(Intensity)
  intensity: Intensity;

  @IsISO8601()
  startedAt: string;

  @IsOptional()
  @IsString()
  comment?: string;
}