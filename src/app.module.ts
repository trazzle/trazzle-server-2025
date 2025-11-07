import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from './common/configs/app.config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { DiscordsModule } from './discords/discords.module';

@Module({
  imports: [ConfigModule.forRoot(configModuleOptions), PrismaModule, RedisCacheModule, DiscordsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
