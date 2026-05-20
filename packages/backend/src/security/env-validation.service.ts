import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  TELEGRAM_BOT_TOKEN: string;
  MINIO_ENDPOINT?: string;
  MINIO_ACCESS_KEY?: string;
  MINIO_SECRET_KEY?: string;
  MINIO_BUCKET?: string;
  YOOKASSA_SHOP_ID?: string;
  YOOKASSA_SECRET_KEY?: string;
}

@Injectable()
export class EnvValidationService {
  constructor(private configService: ConfigService) {}

  validate(): EnvConfig {
    const schema = Joi.object({
      NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
      
      PORT: Joi.number()
        .default(3001),
      
      DATABASE_URL: Joi.string()
        .required()
        .description('PostgreSQL connection string'),
      
      REDIS_HOST: Joi.string()
        .default('localhost'),
      
      REDIS_PORT: Joi.number()
        .default(6379),
      
      JWT_SECRET: Joi.string()
        .min(32)
        .required()
        .description('JWT secret key (min 32 characters)'),
      
      JWT_EXPIRES_IN: Joi.string()
        .default('7d'),
      
      TELEGRAM_BOT_TOKEN: Joi.string()
        .required()
        .description('Telegram bot token'),
      
      MINIO_ENDPOINT: Joi.string()
        .optional(),
      
      MINIO_ACCESS_KEY: Joi.string()
        .optional(),
      
      MINIO_SECRET_KEY: Joi.string()
        .optional(),
      
      MINIO_BUCKET: Joi.string()
        .default('diabeta'),
      
      YOOKASSA_SHOP_ID: Joi.string()
        .optional(),
      
      YOOKASSA_SECRET_KEY: Joi.string()
        .optional(),
    });

    const config = {
      NODE_ENV: this.configService.get<string>('NODE_ENV'),
      PORT: this.configService.get<number>('PORT'),
      DATABASE_URL: this.configService.get<string>('DATABASE_URL'),
      REDIS_HOST: this.configService.get<string>('REDIS_HOST'),
      REDIS_PORT: this.configService.get<number>('REDIS_PORT'),
      JWT_SECRET: this.configService.get<string>('JWT_SECRET'),
      JWT_EXPIRES_IN: this.configService.get<string>('JWT_EXPIRES_IN'),
      TELEGRAM_BOT_TOKEN: this.configService.get<string>('TELEGRAM_BOT_TOKEN'),
      MINIO_ENDPOINT: this.configService.get<string>('MINIO_ENDPOINT'),
      MINIO_ACCESS_KEY: this.configService.get<string>('MINIO_ACCESS_KEY'),
      MINIO_SECRET_KEY: this.configService.get<string>('MINIO_SECRET_KEY'),
      MINIO_BUCKET: this.configService.get<string>('MINIO_BUCKET'),
      YOOKASSA_SHOP_ID: this.configService.get<string>('YOOKASSA_SHOP_ID'),
      YOOKASSA_SECRET_KEY: this.configService.get<string>('YOOKASSA_SECRET_KEY'),
    };

    const { error, value: validatedConfig } = schema.validate(config);

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return validatedConfig;
  }
}
