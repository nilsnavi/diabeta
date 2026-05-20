import { IsEnum, IsOptional } from 'class-validator';
import { FamilyAccessLevel, FamilyAccessStatus } from './create-invite.dto';

export class UpdateAccessDto {
  @IsOptional()
  @IsEnum(FamilyAccessLevel)
  accessLevel?: FamilyAccessLevel;

  @IsOptional()
  @IsEnum(FamilyAccessStatus)
  status?: FamilyAccessStatus;
}