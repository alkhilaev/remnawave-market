import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { PrismaService } from '@modules/prisma/prisma.service';

/**
 * Health Check модуль
 * Предоставляет endpoints для мониторинга состояния сервиса
 */
@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty', // Красивые логи ошибок
    }),
    HttpModule,
    PrismaModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class HealthModule {}
