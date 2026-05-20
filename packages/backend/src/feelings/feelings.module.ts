import { Module } from '@nestjs/common';
import { FeelingsService } from './feelings.service';
import { FeelingsController } from './feelings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FeelingsController],
  providers: [FeelingsService],
  exports: [FeelingsService],
})
export class FeelingsModule {}