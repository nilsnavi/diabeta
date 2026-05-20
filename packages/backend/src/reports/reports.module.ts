import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsProcessor } from './reports.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reports',
    }),
    PrismaModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsProcessor],
  exports: [ReportsService],
})
export class ReportsModule {}