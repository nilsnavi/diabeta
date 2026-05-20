import { IsDateString, IsEnum } from 'class-validator';

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
  XLSX = 'XLSX',
}

export class CreateReportDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(ReportFormat)
  format: ReportFormat;
}