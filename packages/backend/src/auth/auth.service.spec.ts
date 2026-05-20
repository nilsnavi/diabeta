import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

const BOT_TOKEN = 'test_bot_token_12345';

function buildValidInitData(
  userId = 123456789,
  overrides: { auth_date?: number; hash?: string } = {},
): string {
  const authDate = overrides.auth_date ?? Math.floor(Date.now() / 1000) - 60;

  const user = JSON.stringify({
    id: userId,
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser',
  });

  const params = new URLSearchParams({
    user,
    auth_date: String(authDate),
    query_id: 'test_query_id',
  });

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();

  const hash =
    overrides.hash ??
    crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  params.set('hash', hash);
  return params.toString();
}

describe('AuthService', () => {
  let authService: AuthService;

  const mockUser = {
    id: 'uuid-1',
    telegramId: BigInt(111222333),
    onboardingCompleted: false,
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    languageCode: null,
    timezone: null,
    diabetesType: null,
    glucoseUnit: 'MMOL_L',
    targetGlucoseMin: null,
    targetGlucoseMax: null,
    usesInsulin: false,
    usesMedications: false,
    usesCgm: false,
    acceptedTermsAt: null,
    acceptedPrivacyAt: null,
    acceptedHealthDataConsentAt: null,
    subscriptionPlan: 'FREE',
    subscriptionStatus: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock.jwt.token'),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultVal?: string) => {
      if (key === 'TELEGRAM_BOT_TOKEN') return BOT_TOKEN;
      if (key === 'JWT_SECRET') return 'test_secret';
      if (key === 'JWT_EXPIRES_IN') return defaultVal ?? '7d';
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyInitData', () => {
    it('should return TelegramUser for valid initData', () => {
      const initData = buildValidInitData(123456789);
      const result = authService.verifyInitData(initData);
      expect(result.id).toBe(123456789);
      expect(result.username).toBe('testuser');
    });

    it('should throw UnauthorizedException for invalid hash', () => {
      const initData = buildValidInitData(123456789, { hash: 'badhash000' });
      expect(() => authService.verifyInitData(initData)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when hash is missing', () => {
      const params = new URLSearchParams({
        user: JSON.stringify({ id: 1 }),
        auth_date: String(Math.floor(Date.now() / 1000)),
      });
      expect(() => authService.verifyInitData(params.toString())).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired initData', () => {
      const expiredAuthDate = Math.floor(Date.now() / 1000) - 90000; // 25 hours ago
      const initData = buildValidInitData(123456789, { auth_date: expiredAuthDate });
      expect(() => authService.verifyInitData(initData)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when auth_date is missing', () => {
      const params = new URLSearchParams({
        user: JSON.stringify({ id: 1 }),
        hash: 'abc',
      });
      expect(() => authService.verifyInitData(params.toString())).toThrow(UnauthorizedException);
    });
  });

  describe('loginWithTelegram', () => {
    it('should create new user and return accessToken', async () => {
      const initData = buildValidInitData(111222333);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await authService.loginWithTelegram({ initData });

      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock.jwt.token');
      // Convert BigInt to string for comparison if needed, or ensure types match
      expect(String(result.user.telegramId)).toBe('111222333');
      expect(result.user.onboardingCompleted).toBe(false);
    });

    it('should return existing user accessToken', async () => {
      const initData = buildValidInitData(111222333);
      const existingUser = { ...mockUser, onboardingCompleted: true };
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      const result = await authService.loginWithTelegram({ initData });

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(result.user.id).toBe('uuid-1');
      expect(result.user.onboardingCompleted).toBe(true);
    });

    it('should throw UnauthorizedException for invalid initData', async () => {
      await expect(
        authService.loginWithTelegram({ initData: 'invalid_data' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});