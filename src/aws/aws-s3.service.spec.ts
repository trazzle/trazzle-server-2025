import { Test, TestingModule } from '@nestjs/testing';
import { AwsS3Service } from './aws-s3.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configModuleOptions } from '../common/configs/app.config';
import { NotFoundException } from '@nestjs/common';

describe('AwsS3Service', () => {
  let service: AwsS3Service;
  let configService: ConfigService;
  let s3Bucket: string;
  let s3Region: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(configModuleOptions)],
      providers: [AwsS3Service],
    }).compile();

    service = module.get<AwsS3Service>(AwsS3Service);
    configService = module.get<ConfigService>(ConfigService);
    s3Bucket = configService.get<string>('app.s3BucketName') ?? '';
    s3Region = configService.get<string>('app.s3Region') ?? 'ap-northeast-2';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(configService).toBeDefined();
    expect(s3Bucket).toBeDefined();
    expect(s3Region).toBeDefined();
  });
  /** getFile */
  describe('getFile', () => {
    it('S3에서 서비스 이용약관 pdf 파일 조회를 성공한다', async () => {
      // given - key: 서비스 이용약관 pdf 파일
      const servicePolicyKey = 'policies/trazzle_terms_of_service.pdf';

      // when
      const result = await service.getFile(servicePolicyKey);

      // then
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    }, 10000);
    it('S3버킷에 유효하지않은 key를 가진경우 NotFoundException 예외를 발생한다.', async () => {
      // given - key: 유효하지 않은 파일 key
      const invalidKey = 'invalid/path/to/nonexistent_file.txt';

      // when & then
      await expect(service.getFile(invalidKey)).rejects.toThrow(NotFoundException);
    });
  });
});
