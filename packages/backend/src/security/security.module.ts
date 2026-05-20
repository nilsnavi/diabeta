import { Module, Global } from '@nestjs/common';
import { OwnershipGuard } from './ownership.guard';
import { AuditLogService } from './audit-log.service';
import { EnvValidationService } from './env-validation.service';
import { UserDataService } from './user-data.service';
import { UserDataController } from './user-data.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [UserDataController],
  providers: [OwnershipGuard, AuditLogService, EnvValidationService, UserDataService],
  exports: [OwnershipGuard, AuditLogService, EnvValidationService, UserDataService],
})
export class SecurityModule {}
