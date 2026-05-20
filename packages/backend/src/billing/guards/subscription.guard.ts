import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PLANS } from '../plans.config';

export const REQUIRE_PREMIUM = 'require_premium';
/** Decorator: mark a route as Premium-only */
export const RequirePremium = () => SetMetadata(REQUIRE_PREMIUM, true);

/** Decorator: enforce a specific feature flag */
export const REQUIRE_FEATURE_KEY = 'require_feature';
export type PlanFeatureKey = keyof (typeof PLANS)['FREE'];
export const RequireFeature = (feature: PlanFeatureKey) =>
  SetMetadata(REQUIRE_FEATURE_KEY, feature);

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirePremium = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_PREMIUM,
      [context.getHandler(), context.getClass()],
    );

    const requireFeature = this.reflector.getAllAndOverride<PlanFeatureKey>(
      REQUIRE_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requirePremium && !requireFeature) return true;

    const request = context.switchToHttp().getRequest();
    const userId: string | undefined = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlan: true, subscriptionStatus: true },
    });

    const plan = user?.subscriptionPlan ?? 'FREE';
    const features = PLANS[plan];

    if (requirePremium && plan !== 'PREMIUM') {
      throw new ForbiddenException('Premium subscription required');
    }

    if (requireFeature && !features[requireFeature]) {
      throw new ForbiddenException(
        `Feature "${requireFeature}" requires a Premium subscription`,
      );
    }

    return true;
  }
}