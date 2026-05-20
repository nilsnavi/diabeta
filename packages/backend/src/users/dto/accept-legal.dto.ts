import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptLegalDto {
  @ApiProperty()
  @IsBoolean()
  acceptTerms: boolean;

  @ApiProperty()
  @IsBoolean()
  acceptPrivacy: boolean;

  @ApiProperty()
  @IsBoolean()
  acceptHealthDataConsent: boolean;
}