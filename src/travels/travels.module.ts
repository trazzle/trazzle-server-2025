import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TRAVELS } from './travels.repository.interface';
import { TravelRepositoryImpl } from './travel.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: TRAVELS,
      useClass: TravelRepositoryImpl,
    },
  ],
  controllers: [],
  exports: [],
})
export class TravelsModule {}
