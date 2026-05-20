import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Req,
  UseGuards,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /** GET /billing/plans — public, no auth required */
  @Get('plans')
  getPlans() {
    return this.billingService.getPlans();
  }

  /** POST /billing/checkout — create payment session */
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  createCheckout(
    @CurrentUser() user: { id: string },
    @Body() dto: CheckoutDto,
  ) {
    return this.billingService.createCheckout(user.id, dto);
  }

  /**
   * POST /billing/webhook/:provider
   * Called by payment provider. Not authenticated via JWT.
   * Security is handled inside the service (signature verification).
   */
  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Param('provider') provider: string,
    @Req() req: Request,
    @Headers('x-signature') signature: string,
  ) {
    return this.billingService.handleWebhook(provider, req.body, signature ?? '');
  }

  /** GET /billing/subscription — current user's subscription */
  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  getSubscription(@CurrentUser() user: { id: string }) {
    return this.billingService.getSubscription(user.id);
  }

  /** POST /billing/cancel — cancel Premium subscription */
  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  cancelSubscription(@CurrentUser() user: { id: string }) {
    return this.billingService.cancelSubscription(user.id);
  }
}