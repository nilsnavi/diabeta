import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum InsulinType {
  RAPID = 'rapid',
  SHORT = 'short',
  BASAL = 'basal',
  MIXED = 'mixed',
  OTHER = 'other',
}

export enum InjectionSite {
  ABDOMEN = 'abdomen',
  THIGH = 'thigh',
  ARM = 'arm',
  BUTTOCK = 'buttock',
  OTHER = 'other',
}

export class CreateInsulinDto {
  @IsEnum(InsulinType)
  @IsNotEmpty()
  insulinType: InsulinType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  insulinName?: string;

  @IsNumber()
  @Min(0.5)
  @Max(100)
  units: number;

  @IsDateString()
  @IsNotEmpty()
  injectedAt: string;

  @IsOptional()
  @IsEnum(InjectionSite)
  injectionSite?: InjectionSite;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}