import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { IRedisCache } from './redis-cache.interface';

@Injectable()
export class RedisCacheService implements IRedisCache {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   *
   * @param key
   * @returns key매핑된 value값
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      // string 타입이면 그대로 반환
      return value as T;
    }
  }
  /**
   *
   * @param key - 키값 (고유값)
   * @param value - 저장값
   * @param ttl - 유효시간(초)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }
  /**
   * 
   * @param key - 키값 (고유값)
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
