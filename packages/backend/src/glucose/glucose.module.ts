import { Module } from '@nestjs/common';
import { GlucoseService } from './glucose.service';
import { GlucoseController } from './glucose.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GlucoseController],
  providers: [GlucoseService],
  exports: [GlucoseService],
})
export class GlucoseModule {}