import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepositoryImpl } from './users.repository';
import { USERS } from './users.repository.interface';
import { PrismaModule } from '../prisma/prisma.module';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [PrismaModule, ConfigModule, AwsModule],
  providers: [
    UsersService,
    {
      provide: USERS,
      useClass: UserRepositoryImpl,
    },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
