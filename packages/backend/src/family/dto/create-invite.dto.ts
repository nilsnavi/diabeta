import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum FamilyAccessLevel {
  view_only = 'view_only',
  view_and_notifications = 'view_and_notifications',
  full_without_delete = 'full_without_delete',
}

export enum FamilyAccessStatus {
  pending = 'pending',
  active = 'active',
  revoked = 'revoked',
}

export class CreateInviteDto {
  @IsEnum(FamilyAccessLevel)
  accessLevel: FamilyAccessLevel;

  @IsOptional()
  @IsString()
  inviteEmail?: string;
}
