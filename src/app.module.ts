import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from 'src/auth/guards/jwt-auth.guard';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { AwsModule } from './aws/aws.module';
import { CitiesModule } from './cities/cities.module';
import { configModuleOptions } from './common/configs/app.config';
import { CountriesModule } from './countries/countries.module';
import { DiscordsModule } from './discords/discords.module';
import { MagnetsModule } from './magnets/magnets.module';
import { PoliciesModule } from './policies/policies.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { TravelsModule } from './travels/travels.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    PrismaModule,
    RedisCacheModule,
    DiscordsModule,
    PoliciesModule,
    CountriesModule,
    CitiesModule,
    MagnetsModule,
    TravelsModule,
    AwsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
