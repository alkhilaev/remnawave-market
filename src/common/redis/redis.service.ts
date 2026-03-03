import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private readonly defaultTtl: number;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    this.defaultTtl = this.configService.get<number>('CACHE_TTL', 300) * 1000;

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      keyPrefix: 'remnawave-market:',
      lazyConnect: true,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error', err.message);
    });
  }

  async onModuleInit() {
    await this.client.connect();
    this.logger.log('Redis connected');
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (data === null) return null;
    return JSON.parse(data) as T;
  }

  async set(key: string, value: unknown, ttlMs?: number): Promise<void> {
    const ttl = ttlMs ?? this.defaultTtl;
    await this.client.set(key, JSON.stringify(value), 'PX', ttl);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
