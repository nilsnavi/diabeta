import { Module } from '@nestjs/common';
import { InsulinService } from './insulin.service';
import { InsulinController } from './insulin.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InsulinController],
  providers: [InsulinService],
})
export class InsulinModule {}