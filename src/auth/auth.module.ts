import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { StringValue } from 'ms';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { UserCacheRepositoryImpl } from '../users/users.cache-repository';
import { USERS_CACHE } from '../users/users.cache-repository.interface';
import { UsersModule } from '../users/users.module';
import { UserRepositoryImpl } from '../users/users.repository';
import { USERS } from '../users/users.repository.interface';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleService } from './domains/google.service';
import { KakaoService } from './domains/kakao.service';
import { JwtStrategy } from './guards/jwt.strategy';

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
    AccessTokenGuard,
    KakaoService,
    GoogleService,
  ],
  controllers: [AuthController],
  exports: [AuthService, AccessTokenGuard],
})
export class AuthModule {}
