import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  const corsOrigins = configService.get('CORS_ORIGINS')?.split(',') || ['http://localhost:3001'];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Swagger documentation (опционально, управляется через .env)
  const swaggerEnabled = configService.get('SWAGGER_ENABLED') === 'true';
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Remnawave Market API')
      .setDescription('Open-source VPN subscription marketplace for Remnawave')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  if (swaggerEnabled) {
    console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  }
}

bootstrap();
