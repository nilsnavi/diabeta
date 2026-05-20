import {
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MealType } from '@prisma/client';

export class CreateMealDto {
  @ApiProperty({ enum: MealType })
  @IsEnum(MealType)
  mealType: MealType;

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ required: false, minimum: 0, maximum: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  carbs?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  breadUnits?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5000)
  calories?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 300 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  proteins?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 300 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  fats?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty()
  @IsDateString()
  eatenAt: string;

  @ApiProperty({ required: false, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}