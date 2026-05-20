import {
  IsEnum,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DiabetesType, GlucoseUnit } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ enum: DiabetesType })
  @IsOptional()
  @IsEnum(DiabetesType)
  diabetesType?: DiabetesType;

  @ApiPropertyOptional({ enum: GlucoseUnit })
  @IsOptional()
  @IsEnum(GlucoseUnit)
  glucoseUnit?: GlucoseUnit;

  @ApiPropertyOptional({ minimum: 2.0, maximum: 20.0 })
  @IsOptional()
  @IsNumber()
  @Min(2.0)
  @Max(20.0)
  targetGlucoseMin?: number;

  @ApiPropertyOptional({ minimum: 2.0, maximum: 25.0 })
  @IsOptional()
  @IsNumber()
  @Min(2.0)
  @Max(25.0)
  targetGlucoseMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  usesInsulin?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  usesMedications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  usesCgm?: boolean;

  @ApiPropertyOptional({ example: 'Europe/Moscow' })
  @IsOptional()
  @IsString()
  timezone?: string;
}