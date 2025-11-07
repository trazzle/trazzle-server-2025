import { Module } from '@nestjs/common';
import { DiscordsService } from './discords.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [DiscordsService],
  exports: [DiscordsService],
})
export class DiscordsModule {}
