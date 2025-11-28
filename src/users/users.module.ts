import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepositoryImpl } from './users.repository';
import { USERS } from './users.repository.interface';
import { PrismaModule } from '../prisma/prisma.module';
import { AwsModule } from '../aws/aws.module';
import { UserTravelStatisticsService } from './user-statistics.service';
import { TRAVELS } from '../travels/travels.repository.interface';
import { TravelRepositoryImpl } from '../travels/travel.repository';

@Module({
  imports: [PrismaModule, ConfigModule, AwsModule],
  providers: [
    UsersService,
    UserTravelStatisticsService,
    {
      provide: USERS,
      useClass: UserRepositoryImpl,
    },
    {
      provide: TRAVELS,
      useClass: TravelRepositoryImpl,
    },
  ],
  controllers: [UsersController],
  exports: [UsersService, UserTravelStatisticsService],
})
export class UsersModule {}
