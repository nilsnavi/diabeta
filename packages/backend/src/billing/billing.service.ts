import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { YookassaProvider } from './providers/yookassa.provider';
import { CheckoutDto, PaymentProvider } from './dto/checkout.dto';
import { PLANS, PREMIUM_PRICE_RUB, PREMIUM_DURATION_DAYS } from './plans.config';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private prisma: PrismaService,
    private yookassa: YookassaProvider,
  ) {}

  getPlans() {
    return [
      {
        id: 'FREE',
        name: 'Free',
        priceRub: 0,
        features: PLANS.FREE,
      },
      {
        id: 'PREMIUM',
        name: 'Premium',
        priceRub: PREMIUM_PRICE_RUB,
        durationDays: PREMIUM_DURATION_DAYS,
        features: PLANS.PREMIUM,
      },
    ];
  }

  async createCheckout(userId: string, dto: CheckoutDto) {
    if (dto.plan !== 'PREMIUM') {
      throw new BadRequestException('Only PREMIUM plan requires payment');
    }

    // Check for existing active premium
    const existing = await this.prisma.subscription.findFirst({
      where: {
        userId,
        plan: 'PREMIUM',
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
    });
    if (existing) {
      throw new BadRequestException('You already have an active Premium subscription');
    }

    const provider = this.resolveProvider(dto.provider);
    const result = await provider.createPayment({
      userId,
      amountRub: PREMIUM_PRICE_RUB,
      description: 'DiaBeta Premium — 30 дней',
      metadata: { userId, plan: dto.plan, provider: dto.provider },
    });

    // Record pending subscription
    await this.prisma.subscription.create({
      data: {
        userId,
        plan: 'PREMIUM',
        status: 'TRIAL', // pending until webhook confirms
        startsAt: new Date(),
        paymentId: result.paymentId,
        paymentProvider: dto.provider,
      },
    });

    return { paymentId: result.paymentId, confirmationUrl: result.confirmationUrl };
  }

  async handleWebhook(provider: string, payload: unknown, signature: string) {
    const providerInstance = this.resolveProvider(provider as PaymentProvider);
    if (!providerInstance.verifyWebhook(payload, signature)) {
      throw new ForbiddenException('Invalid webhook signature');
    }

    // YooKassa payload structure
    const event = payload as {
      event: string;
      object: { id: string; status: string; metadata: Record<string, string> };
    };

    if (event.event !== 'payment.succeeded') {
      return { ok: true };
    }

    const paymentId = event.object.id;
    const { userId, plan } = event.object.metadata ?? {};

    if (!userId || !plan) {
      this.logger.warn(`Webhook missing metadata for payment ${paymentId}`);
      return { ok: true };
    }

    await this.activateSubscription(userId, plan, paymentId, provider);
    return { ok: true };
  }

  async getSubscription(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlan: true, subscriptionStatus: true },
    });

    return {
      plan: user?.subscriptionPlan ?? 'FREE',
      status: user?.subscriptionStatus ?? 'ACTIVE',
      subscription: sub ?? null,
      features: PLANS[user?.subscriptionPlan ?? 'FREE'],
    };
  }

  async cancelSubscription(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, plan: 'PREMIUM', status: 'ACTIVE' },
    });

    if (!sub) {
      throw new NotFoundException('No active Premium subscription found');
    }

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'CANCELLED' },
    });

    // Downgrade user immediately
    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionPlan: 'FREE', subscriptionStatus: 'ACTIVE' },
    });

    return { cancelled: true };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async activateSubscription(
    userId: string,
    plan: string,
    paymentId: string,
    provider: string,
  ) {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + PREMIUM_DURATION_DAYS);

    // Upsert subscription record
    const existing = await this.prisma.subscription.findFirst({
      where: { userId, paymentId },
    });

    if (existing) {
      await this.prisma.subscription.update({
        where: { id: existing.id },
        data: {
          status: 'ACTIVE',
          startsAt: now,
          expiresAt,
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          userId,
          plan: 'PREMIUM',
          status: 'ACTIVE',
          startsAt: now,
          expiresAt,
          paymentId,
          paymentProvider: provider,
        },
      });
    }

    // Upgrade user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: 'PREMIUM',
        subscriptionStatus: 'ACTIVE',
      },
    });

    this.logger.log(`Activated PREMIUM for user ${userId} until ${expiresAt.toISOString()}`);
  }

  private resolveProvider(provider: PaymentProvider | string) {
    // MVP: only YooKassa is implemented; others stub to same instance
    return this.yookassa;
  }

  // ── Scheduled job ─────────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_HOUR)
  async checkExpiredSubscriptions() {
    const expired = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        plan: 'PREMIUM',
        expiresAt: { lte: new Date() },
      },
      select: { id: true, userId: true },
    });

    if (expired.length === 0) return;

    this.logger.log(`Expiring ${expired.length} subscription(s)`);

    for (const sub of expired) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'EXPIRED' },
      });

      await this.prisma.user.update({
        where: { id: sub.userId },
        data: { subscriptionPlan: 'FREE', subscriptionStatus: 'ACTIVE' },
      });
    }
  }
}