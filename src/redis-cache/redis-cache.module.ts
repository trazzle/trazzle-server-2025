import { Module } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>('app.redisUrl');
        const redisHost = configService.getOrThrow<string>('app.redisHost');
        const redisPort = configService.getOrThrow<number>('app.redisPort');
        return {
          type: 'single',
          url: redisUrl,
          options: {
            host: redisHost,
            port: redisPort,
          },
        };
      },
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
