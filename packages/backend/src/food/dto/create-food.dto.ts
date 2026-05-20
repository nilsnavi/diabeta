import { IsString, IsNumber, IsDate, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MealType } from '@prisma/client';

export class CreateFoodDto {
  @ApiProperty({ enum: MealType })
  @IsEnum(MealType)
  mealType: MealType;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  carbohydrates?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  calories?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  protein?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  fat?: number;

  @ApiProperty()
  @IsDate()
  eatenAt: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
