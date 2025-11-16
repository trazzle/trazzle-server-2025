import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import {
  IUsersCacheRepository,
  USER_ACCESS_TOKEN_KEY,
  USER_REFRESH_TOKEN_KEY,
} from './users.cache-repository.interface';

@Injectable()
export class UserCacheRepositoryImpl implements IUsersCacheRepository {
  constructor(private readonly redis: RedisCacheService) {}

  async getUserAccessToken(id: number): Promise<any> {
    const key = USER_ACCESS_TOKEN_KEY(id);
    return await this.redis.get(key);
  }
  async setUserAccessToken(id: number, value: any): Promise<void> {
    const key = USER_ACCESS_TOKEN_KEY(id);
    await this.redis.set(key, value, 3600); // TTL: 1Hour
  }
  async getUserRefreshToken(id: number): Promise<any> {
    const key = USER_REFRESH_TOKEN_KEY(id);
    return await this.redis.get(key);
  }
  async setUserRefreshToken(id: number, value: any): Promise<void> {
    const key = USER_REFRESH_TOKEN_KEY(id);
    await this.redis.set(key, value, 3600 * 24 * 7); // TTL: 7Days
  }
}
