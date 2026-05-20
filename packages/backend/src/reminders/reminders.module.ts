import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RemindersController } from './reminders.controller';
import { RemindersService, REMINDERS_QUEUE } from './reminders.service';
import { RemindersProcessor } from './reminders.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: REMINDERS_QUEUE,
    }),
    PrismaModule,
  ],
  controllers: [RemindersController],
  providers: [RemindersService, RemindersProcessor],
  exports: [RemindersService],
})
export class RemindersModule {}