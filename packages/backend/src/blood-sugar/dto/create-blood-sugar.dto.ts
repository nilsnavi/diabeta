import { IsNumber, IsDate, IsOptional, IsBoolean, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GlucoseUnit } from '@prisma/client';

export class CreateBloodSugarDto {
  @ApiProperty()
  @IsNumber()
  value: number;

  @ApiProperty({ enum: GlucoseUnit })
  @IsEnum(GlucoseUnit)
  unit: GlucoseUnit;

  @ApiProperty()
  @IsDate()
  measuredAt: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  beforeMeal?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  afterMeal?: boolean;
}
