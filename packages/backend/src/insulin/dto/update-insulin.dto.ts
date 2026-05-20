import { PartialType } from '@nestjs/mapped-types';
import { CreateInsulinDto } from './create-insulin.dto';

export class UpdateInsulinDto extends PartialType(CreateInsulinDto) {}