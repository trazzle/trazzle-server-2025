import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from './common/configs/app.config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [ConfigModule.forRoot(configModuleOptions), PrismaModule, RedisModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
