import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { YookassaProvider } from './providers/yookassa.provider';
import { SubscriptionGuard } from './guards/subscription.guard';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  controllers: [BillingController],
  providers: [BillingService, YookassaProvider, SubscriptionGuard],
  exports: [BillingService, SubscriptionGuard],
})
export class BillingModule {}