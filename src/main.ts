import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';
import { WinstonModule } from 'nest-winston';
import helmet from 'helmet';
import * as compression from 'compression';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import { winstonConfig } from '@common/config/winston.config';

async function bootstrap() {
  // Note: patchNestJsSwagger() не нужен в nestjs-zod 5.x

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Validation pipe (nestjs-zod)
  app.useGlobalPipes(new ZodValidationPipe());

  // Security middlewares
  app.use(
    helmet({
      contentSecurityPolicy: false, // Отключаем CSP для Swagger
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Compression middleware
  app.use(compression());

  // HTTP request logging
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => {
          console.log(message.trim());
        },
      },
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
