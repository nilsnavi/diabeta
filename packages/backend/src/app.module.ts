import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DiabetesProfileModule } from './diabetes-profile/diabetes-profile.module';
import { BloodSugarModule } from './blood-sugar/blood-sugar.module';
import { InsulinModule } from './insulin/insulin.module';
import { FoodModule } from './food/food.module';
import { RemindersModule } from './reminders/reminders.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportsModule } from './reports/reports.module';
import { GlucoseModule } from './glucose/glucose.module';
import { MealsModule } from './meals/meals.module';
import { FeelingsModule } from './feelings/feelings.module';
import { ActivityModule } from './activity/activity.module';
import { TimelineModule } from './timeline/timeline.module';
import { AiModule } from './ai/ai.module';
import { FamilyModule } from './family/family.module';
import { BillingModule } from './billing/billing.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { AdminModule } from './admin/admin.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    SecurityModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    DiabetesProfileModule,
    BloodSugarModule,
    InsulinModule,
    FoodModule,
    RemindersModule,
    AnalyticsModule,
    ReportsModule,
    GlucoseModule,
    MealsModule,
    FeelingsModule,
    ActivityModule,
    TimelineModule,
    AiModule,
    FamilyModule,
    BillingModule,
    KnowledgeModule,
    AdminModule,
  ],
})
export class AppModule {}
