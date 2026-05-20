import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDiabetesProfileDto } from './create-diabetes-profile.dto';

export class UpdateDiabetesProfileDto extends PartialType(
  OmitType(CreateDiabetesProfileDto, [] as const)
) {}
