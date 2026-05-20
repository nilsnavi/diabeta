import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { GlucoseUnit, DiabetesType } from '@prisma/client';

const mockUser = {
  id: 'user-1',
  telegramId: BigInt(123456),
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  languageCode: 'ru',
  timezone: 'Europe/Moscow',
  diabetesType: DiabetesType.TYPE_1,
  glucoseUnit: GlucoseUnit.MMOL_L,
  targetGlucoseMin: 4.0,
  targetGlucoseMax: 10.0,
  usesInsulin: true,
  usesMedications: false,
  usesCgm: false,
  onboardingCompleted: false,
  acceptedTermsAt: null,
  acceptedPrivacyAt: null,
  acceptedHealthDataConsentAt: null,
  subscriptionPlan: 'FREE' as const,
  subscriptionStatus: 'ACTIVE' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            reminder: {
              updateMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  describe('getMe', () => {
    it('should return the user if exists and not deleted', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.getMe('user-1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(service.getMe('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMe', () => {
    beforeEach(() => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockImplementation(({ data }) =>
        Promise.resolve({ ...mockUser, ...data }),
      );
    });

    it('should update profile fields', async () => {
      const result = await service.updateMe('user-1', {
        timezone: 'Europe/London',
      });
      expect(result.timezone).toBe('Europe/London');
    });

    it('should throw BadRequestException when min >= max (both provided)', async () => {
      await expect(
        service.updateMe('user-1', {
          targetGlucoseMin: 10.0,
          targetGlucoseMax: 8.0,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when min equals max', async () => {
      await expect(
        service.updateMe('user-1', {
          targetGlucoseMin: 8.0,
          targetGlucoseMax: 8.0,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid glucose range', async () => {
      await expect(
        service.updateMe('user-1', {
          targetGlucoseMin: 4.0,
          targetGlucoseMax: 10.0,
        }),
      ).resolves.toBeDefined();
    });

    it('should throw BadRequestException when new min exceeds existing max', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        targetGlucoseMax: 8.0,
      });
      await expect(
        service.updateMe('user-1', { targetGlucoseMin: 9.0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when new max is less than existing min', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        targetGlucoseMin: 5.0,
      });
      await expect(
        service.updateMe('user-1', { targetGlucoseMax: 4.0 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteMe', () => {
    it('should soft delete user and disable reminders', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}]);

      const result = await service.deleteMe('user-1');
      expect(result).toEqual({ message: 'Account deleted' });
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user already deleted', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(service.deleteMe('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('acceptLegal', () => {
    beforeEach(() => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        acceptedTermsAt: new Date(),
        acceptedPrivacyAt: new Date(),
        acceptedHealthDataConsentAt: new Date(),
      });
    });

    it('should accept all legal docs', async () => {
      const result = await service.acceptLegal('user-1', {
        acceptTerms: true,
        acceptPrivacy: true,
        acceptHealthDataConsent: true,
      });
      expect(result.acceptedTermsAt).toBeDefined();
    });

    it('should throw BadRequestException if terms not accepted', async () => {
      await expect(
        service.acceptLegal('user-1', {
          acceptTerms: false,
          acceptPrivacy: true,
          acceptHealthDataConsent: true,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if privacy not accepted', async () => {
      await expect(
        service.acceptLegal('user-1', {
          acceptTerms: true,
          acceptPrivacy: false,
          acceptHealthDataConsent: true,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if health consent not accepted', async () => {
      await expect(
        service.acceptLegal('user-1', {
          acceptTerms: true,
          acceptPrivacy: true,
          acceptHealthDataConsent: false,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeOnboarding', () => {
    it('should complete onboarding when all legal docs accepted', async () => {
      const userWithLegal = {
        ...mockUser,
        acceptedTermsAt: new Date(),
        acceptedPrivacyAt: new Date(),
        acceptedHealthDataConsentAt: new Date(),
      };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(userWithLegal);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...userWithLegal,
        onboardingCompleted: true,
      });

      const result = await service.completeOnboarding('user-1');
      expect(result.onboardingCompleted).toBe(true);
    });

    it('should throw ForbiddenException if legal docs not accepted', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser); // no legal dates
      await expect(service.completeOnboarding('user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if only some legal docs accepted', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        ...mockUser,
        acceptedTermsAt: new Date(),
        acceptedPrivacyAt: new Date(),
        // missing acceptedHealthDataConsentAt
      });
      await expect(service.completeOnboarding('user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});