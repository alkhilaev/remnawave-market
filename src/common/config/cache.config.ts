import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { createClient } from 'redis';

/**
 * Конфигурация Redis Cache
 * Использует Keyv для работы с Redis
 */
export const getCacheConfig = (): CacheModuleAsyncOptions => ({
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = configService.get<string>('REDIS_PASSWORD');
    const ttl = configService.get<number>('CACHE_TTL', 300) * 1000; // секунды -> миллисекунды

    // Создаём Redis client
    const redisClient = createClient({
      socket: {
        host: redisHost,
        port: redisPort,
      },
      password: redisPassword,
    });

    // Подключаемся к Redis
    await redisClient.connect().catch((err) => {
      console.error('Redis connection error:', err);
    });

    // Создаём Redis адаптер для Keyv
    const keyvRedis = new KeyvRedis(redisClient);

    // Создаём Keyv instance
    const keyv = new Keyv({
      store: keyvRedis,
      ttl,
      namespace: 'remnawave-market',
    });

    // Обработка ошибок
    keyv.on('error', (err) => {
      console.error('Redis Cache Error:', err);
    });

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      store: keyv as any,
      ttl,
    };
  },
  inject: [ConfigService],
});
