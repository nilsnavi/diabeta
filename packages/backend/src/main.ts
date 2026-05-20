import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { EnvValidationService } from './security/env-validation.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Валидация environment переменных при старте
  try {
    const envValidator = app.get(EnvValidationService);
    envValidator.validate();
    Logger.log('✅ Environment variables validated successfully', 'Bootstrap');
  } catch (error: any) {
    Logger.error(`❌ Environment validation failed: ${error.message}`, 'Bootstrap');
    process.exit(1);
  }

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('DiaBeta API')
    .setDescription('Diabetes Assistant API')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('diabetes-profile')
    .addTag('blood-sugar')
    .addTag('insulin')
    .addTag('food')
    .addTag('reminders')
    .addTag('analytics')
    .addTag('reports')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  Logger.log(`🚀 Application is running on: http://localhost:${port}`, 'Bootstrap');
  Logger.log(`📚 Swagger documentation: http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`🔒 Security features enabled: JWT auth, ownership validation, audit logging`, 'Bootstrap');
}

bootstrap();
