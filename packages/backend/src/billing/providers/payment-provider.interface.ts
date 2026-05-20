export interface CreatePaymentResult {
  paymentId: string;
  confirmationUrl: string;
}

export interface PaymentProvider {
  createPayment(params: {
    userId: string;
    amountRub: number;
    description: string;
    metadata: Record<string, string>;
  }): Promise<CreatePaymentResult>;

  verifyWebhook(payload: unknown, signature: string): boolean;
}