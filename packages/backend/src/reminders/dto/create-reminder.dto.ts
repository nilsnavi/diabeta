import { IsEnum, IsString, IsOptional, IsBoolean, Matches } from 'class-validator';
import { ReminderType } from '@prisma/client';

export class CreateReminderDto {
  @IsEnum(ReminderType)
  type: ReminderType;

  @IsString()
  title: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'time must be in HH:MM format' })
  time: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  repeatRule?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}