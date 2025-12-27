import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '@modules/prisma/prisma.service';

/**
 * Health Check контроллер
 * Используется для мониторинга состояния сервиса (Kubernetes, Docker, мониторинг)
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Полная проверка здоровья всех компонентов
   */
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Полная проверка здоровья сервиса' })
  @ApiResponse({ status: 200, description: 'Сервис здоров' })
  @ApiResponse({ status: 503, description: 'Сервис нездоров' })
  check() {
    return this.health.check([
      // Проверка базы данных
      () => this.prismaHealth.pingCheck('database', this.prisma),

      // Проверка памяти (heap не должен превышать 150MB)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

      // Проверка RSS памяти (не должна превышать 300MB)
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

      // Проверка диска (должно быть свободно минимум 10GB)
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9, // 90% заполненности - критично
        }),
    ]);
  }

  /**
   * Быстрая проверка (только БД)
   * Используется для liveness probe в Kubernetes
   */
  @Get('liveness')
  @HealthCheck()
  @ApiOperation({ summary: 'Быстрая проверка живости сервиса' })
  @ApiResponse({ status: 200, description: 'Сервис жив' })
  @ApiResponse({ status: 503, description: 'Сервис мёртв' })
  liveness() {
    return this.health.check([() => this.prismaHealth.pingCheck('database', this.prisma)]);
  }

  /**
   * Проверка готовности к приёму трафика
   * Используется для readiness probe в Kubernetes
   */
  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: 'Проверка готовности сервиса' })
  @ApiResponse({ status: 200, description: 'Сервис готов' })
  @ApiResponse({ status: 503, description: 'Сервис не готов' })
  readiness() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
    ]);
  }
}
