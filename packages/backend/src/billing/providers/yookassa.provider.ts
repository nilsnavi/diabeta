import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  PaymentProvider,
  CreatePaymentResult,
} from './payment-provider.interface';

@Injectable()
export class YookassaProvider implements PaymentProvider {
  private readonly logger = new Logger(YookassaProvider.name);
  private readonly shopId: string;
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.yookassa.ru/v3';

  constructor(private config: ConfigService) {
    this.shopId = config.get<string>('YOOKASSA_SHOP_ID', '');
    this.secretKey = config.get<string>('YOOKASSA_SECRET_KEY', '');
  }

  async createPayment(params: {
    userId: string;
    amountRub: number;
    description: string;
    metadata: Record<string, string>;
  }): Promise<CreatePaymentResult> {
    const idempotenceKey = crypto.randomUUID();

    const body = {
      amount: {
        value: params.amountRub.toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: this.config.get<string>(
          'YOOKASSA_RETURN_URL',
          'https://t.me/diabeta_bot',
        ),
      },
      description: params.description,
      metadata: params.metadata,
      capture: true,
    };

    const credentials = Buffer.from(
      `${this.shopId}:${this.secretKey}`,
    ).toString('base64');

    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`YooKassa createPayment failed: ${err}`);
      throw new Error(`YooKassa error: ${response.status}`);
    }

    const data = (await response.json()) as {
      id: string;
      confirmation: { confirmation_url: string };
    };

    return {
      paymentId: data.id,
      confirmationUrl: data.confirmation.confirmation_url,
    };
  }

  verifyWebhook(payload: unknown, signature: string): boolean {
    // YooKassa sends IP-based verification; for extra safety we verify
    // the notification body hash if a webhook secret is configured.
    const webhookSecret = this.config.get<string>('YOOKASSA_WEBHOOK_SECRET');
    if (!webhookSecret) return true; // rely on IP allowlist only

    const hmac = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hmac === signature;
  }
}