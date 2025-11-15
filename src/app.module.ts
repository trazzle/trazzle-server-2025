import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from './common/configs/app.config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { DiscordsModule } from './discords/discords.module';
import { PoliciesModule } from './policies/policies.module';
import { MembersModule } from './members/members.module';
import { CountriesModule } from './countries/countries.module';
import { CitiesModule } from './cities/cities.module';
import { MagnetsModule } from './magnets/magnets.module';
import { TravelsModule } from './travels/travels.module';
import { AwsModule } from './aws/aws.module';

@Module({
  imports: [ConfigModule.forRoot(configModuleOptions), PrismaModule, RedisCacheModule, DiscordsModule, PoliciesModule, MembersModule, CountriesModule, CitiesModule, MagnetsModule, TravelsModule, AwsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
