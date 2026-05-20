import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyzeDiaryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days?: number = 14;
}