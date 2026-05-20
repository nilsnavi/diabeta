import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AcceptLegalDto } from './dto/accept-legal.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    await this.getMe(userId);

    // Validate glucose range consistency
    if (
      dto.targetGlucoseMin !== undefined &&
      dto.targetGlucoseMax !== undefined
    ) {
      if (dto.targetGlucoseMin >= dto.targetGlucoseMax) {
        throw new BadRequestException(
          'targetGlucoseMin must be less than targetGlucoseMax',
        );
      }
    } else if (dto.targetGlucoseMin !== undefined) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.targetGlucoseMax && dto.targetGlucoseMin >= user.targetGlucoseMax) {
        throw new BadRequestException(
          'targetGlucoseMin must be less than targetGlucoseMax',
        );
      }
    } else if (dto.targetGlucoseMax !== undefined) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.targetGlucoseMin && dto.targetGlucoseMax <= user.targetGlucoseMin) {
        throw new BadRequestException(
          'targetGlucoseMax must be greater than targetGlucoseMin',
        );
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.diabetesType !== undefined) data.diabetesType = dto.diabetesType;
    if (dto.glucoseUnit !== undefined) data.glucoseUnit = dto.glucoseUnit;
    if (dto.targetGlucoseMin !== undefined)
      data.targetGlucoseMin = dto.targetGlucoseMin;
    if (dto.targetGlucoseMax !== undefined)
      data.targetGlucoseMax = dto.targetGlucoseMax;
    if (dto.usesInsulin !== undefined) data.usesInsulin = dto.usesInsulin;
    if (dto.usesMedications !== undefined)
      data.usesMedications = dto.usesMedications;
    if (dto.usesCgm !== undefined) data.usesCgm = dto.usesCgm;
    if (dto.timezone !== undefined) data.timezone = dto.timezone;

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async deleteMe(userId: string) {
    await this.getMe(userId);

    const now = new Date();

    // Soft delete: mark deletedAt, disable all reminders
    await this.prisma.$transaction([
      this.prisma.reminder.updateMany({
        where: { userId, deletedAt: null },
        data: { isActive: false, deletedAt: now },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { deletedAt: now },
      }),
    ]);

    return { message: 'Account deleted' };
  }

  async acceptLegal(userId: string, dto: AcceptLegalDto) {
    await this.getMe(userId);

    if (!dto.acceptTerms || !dto.acceptPrivacy || !dto.acceptHealthDataConsent) {
      throw new BadRequestException(
        'You must accept all legal documents: terms, privacy, and health data consent',
      );
    }

    const now = new Date();
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        acceptedTermsAt: now,
        acceptedPrivacyAt: now,
        acceptedHealthDataConsentAt: now,
      },
    });
  }

  async completeOnboarding(userId: string) {
    const user = await this.getMe(userId);

    if (
      !user.acceptedTermsAt ||
      !user.acceptedPrivacyAt ||
      !user.acceptedHealthDataConsentAt
    ) {
      throw new ForbiddenException(
        'Cannot complete onboarding without accepting all legal documents',
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });
  }

  // Legacy methods kept for compatibility
  async getProfile(userId: string) {
    return this.getMe(userId);
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}