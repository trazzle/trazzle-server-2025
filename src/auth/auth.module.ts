import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepositoryImpl } from '../users/users.repository';
import { USERS } from '../users/users.repository.interface';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { USERS_CACHE } from '../users/users.cache-repository.interface';
import { UserCacheRepositoryImpl } from '../users/users.cache-repository';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RedisCacheModule,
    HttpModule,
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('app.jwtSecret')! || '',
          signOptions: {
            expiresIn: config.get<string>('app.jwtExpiration')! as StringValue,
          },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    {
      provide: USERS,
      useClass: UserRepositoryImpl,
    },
    {
      provide: USERS_CACHE,
      useClass: UserCacheRepositoryImpl,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
