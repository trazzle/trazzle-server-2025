import { Module } from '@nestjs/common';
import { AwsModule } from 'src/aws/aws.module';
import { PoliciesController } from './policies.controller';

@Module({
  imports: [AwsModule],
  providers: [],
  controllers: [PoliciesController],
})
export class PoliciesModule {}
