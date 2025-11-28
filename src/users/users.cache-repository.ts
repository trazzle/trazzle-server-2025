import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import {
  IUsersCacheRepository,
  SIGN_IN_USERINFO_KEY,
  USER_ACCESS_TOKEN_KEY,
  USER_REFRESH_TOKEN_KEY,
} from './users.cache-repository.interface';
import { TrazzleUser } from '../auth/trazzle-user.interface';

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
  async delUserAccessToken(id: number): Promise<void> {
    const key = USER_ACCESS_TOKEN_KEY(id);
    await this.redis.del(key);
  }
  async delUserRefreshToken(id: number): Promise<void> {
    const key = USER_REFRESH_TOKEN_KEY(id);
    await this.redis.del(key);
  }
  async setSignInUserInfo(accessToken: string, value: TrazzleUser): Promise<void> {
    const key = SIGN_IN_USERINFO_KEY(accessToken);

    // 직렬화
    const serializedValue = JSON.stringify(value);
    await this.redis.set(key, serializedValue, 3600); // TTL: 1Hour
  }
  async getSignInUserInfo(accessToken: string): Promise<TrazzleUser | null> {
    const key = SIGN_IN_USERINFO_KEY(accessToken);

    const cachedData = await this.redis.get(key);
    if (typeof cachedData !== 'string') {
      return null;
    }

    try {
      // 역직렬화
      return JSON.parse(cachedData) as TrazzleUser;
    } catch {
      return null;
    }
  }
}
