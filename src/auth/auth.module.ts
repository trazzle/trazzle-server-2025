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
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './guards/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GOOGLE_OAUTH_CLIENT_TOKEN } from './google-oauth-token.constant';
import { OAuth2Client } from 'google-auth-library';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RedisCacheModule,
    HttpModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
    JwtStrategy,
    JwtAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
