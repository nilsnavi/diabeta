import { IsEnum, IsOptional, IsNumber, IsString, IsDate, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DiabetesType, GlucoseUnit } from '@prisma/client';

export class CreateDiabetesProfileDto {
  @ApiProperty({ enum: DiabetesType })
  @IsEnum(DiabetesType)
  diabetesType: DiabetesType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  diagnosisDate?: Date;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  targetGlucoseMin: number;

  @ApiProperty()
  @IsNumber()
  @Max(30)
  targetGlucoseMax: number;

  @ApiProperty({ enum: GlucoseUnit, default: GlucoseUnit.MMOL_L })
  @IsEnum(GlucoseUnit)
  glucoseUnit?: GlucoseUnit;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  doctorName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  doctorContact?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
