import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController, KnowledgeAdminController } from './knowledge.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KnowledgeController, KnowledgeAdminController],
  providers: [KnowledgeService],
})
export class KnowledgeModule {}