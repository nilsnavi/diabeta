import {
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  MaxLength,
  IsDateString,
} from 'class-validator';

export enum FeelingType {
  GOOD = 'good',
  NORMAL = 'normal',
  WEAKNESS = 'weakness',
  DIZZY = 'dizzy',
  BAD = 'bad',
  OTHER = 'other',
}

export enum SymptomType {
  SWEATING = 'sweating',
  TREMOR = 'tremor',
  HUNGER = 'hunger',
  HEADACHE = 'headache',
  DROWSINESS = 'drowsiness',
  ANXIETY = 'anxiety',
  NAUSEA = 'nausea',
  THIRST = 'thirst',
  FREQUENT_URINATION = 'frequent_urination',
  OTHER = 'other',
}

export class CreateFeelingDto {
  @IsEnum(FeelingType)
  feeling: FeelingType;

  @IsOptional()
  @IsArray()
  @IsEnum(SymptomType, { each: true })
  symptoms?: SymptomType[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  mood?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  energyLevel?: number;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;

  @IsOptional()
  @MaxLength(1000)
  comment?: string;
}