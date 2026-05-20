import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { TelegramAuthDto } from './dto/login.dto';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  auth_date: number;
}

const MAX_INIT_DATA_AGE_SECONDS = 86400; // 24 hours

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async loginWithTelegram(dto: TelegramAuthDto) {
    const telegramUser = this.verifyInitData(dto.initData);

    const telegramId = BigInt(telegramUser.id);

    let user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          username: telegramUser.username,
          languageCode: telegramUser.language_code,
        },
      });
    }

    const payload = { sub: user.id, telegramId: user.telegramId.toString() };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        onboardingCompleted: user.onboardingCompleted,
      },
    };
  }

  verifyInitData(initData: string): TelegramUser {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    }

    let params: URLSearchParams;
    try {
      params = new URLSearchParams(initData);
    } catch {
      throw new UnauthorizedException('Invalid initData format');
    }

    const hash = params.get('hash');
    if (!hash) {
      throw new UnauthorizedException('Missing hash in initData');
    }

    const authDateStr = params.get('auth_date');
    if (!authDateStr) {
      throw new UnauthorizedException('Missing auth_date in initData');
    }

    const authDate = parseInt(authDateStr, 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > MAX_INIT_DATA_AGE_SECONDS) {
      throw new UnauthorizedException('initData is expired');
    }

    params.delete('hash');
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (expectedHash !== hash) {
      this.logger.warn('initData hash verification failed');
      throw new UnauthorizedException('Invalid initData signature');
    }

    const userStr = params.get('user');
    if (!userStr) {
      throw new UnauthorizedException('Missing user in initData');
    }

    let telegramUser: TelegramUser;
    try {
      telegramUser = JSON.parse(userStr);
    } catch {
      throw new UnauthorizedException('Invalid user JSON in initData');
    }

    if (!telegramUser.id) {
      throw new UnauthorizedException('Missing user id in initData');
    }

    telegramUser.auth_date = authDate;
    return telegramUser;
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}