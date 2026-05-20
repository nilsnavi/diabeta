import {
  IsNumber,
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GlucoseUnit, GlucoseContext } from '@prisma/client';

export class CreateGlucoseDto {
  @ApiProperty({ minimum: 1.0, maximum: 35.0 })
  @IsNumber()
  @Min(1.0)
  @Max(35.0)
  value: number;

  @ApiProperty({ enum: GlucoseUnit, default: GlucoseUnit.MMOL_L })
  @IsOptional()
  @IsEnum(GlucoseUnit)
  unit?: GlucoseUnit;

  @ApiProperty({ enum: GlucoseContext })
  @IsEnum(GlucoseContext)
  context: GlucoseContext;

  @ApiProperty()
  @IsDateString()
  measuredAt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  source?: string;
}