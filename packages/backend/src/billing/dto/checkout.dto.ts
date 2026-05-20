import { IsEnum, IsIn } from 'class-validator';

export enum PaymentProvider {
  YOOKASSA = 'yookassa',
  CLOUDPAYMENTS = 'cloudpayments',
  TELEGRAM = 'telegram',
}

export class CheckoutDto {
  @IsIn(['PREMIUM'])
  plan: 'PREMIUM';

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;
}