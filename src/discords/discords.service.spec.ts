import { Test, TestingModule } from '@nestjs/testing';
import { DiscordsService } from './discords.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configModuleOptions } from '../common/configs/app.config';
import { ErrorResponse } from '../common/exception-filters/error-response.interface';

describe('DiscordsService', () => {
  let service: DiscordsService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(configModuleOptions), HttpModule],
      providers: [DiscordsService],
    }).compile();

    service = module.get<DiscordsService>(DiscordsService);
    configService = module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(configService).toBeDefined();
    expect(httpService).toBeDefined();
  });

  // describe('sendAlert', () => {
  //   it('HTTP 응답중 5xx 예외가 발생시 sendAlert() 호출하여 디스코드 메시지로 전송된다.', async () => {
  //     // given
  //     const errorResponseBody: ErrorResponse = {
  //       statusCode: 500,
  //       error: 'Internal Server Error',
  //       message: 'Integration Test Internal Server Error',
  //       method: 'GET',
  //       path: '/api/health-check',
  //       timestamp: new Date().toISOString(),
  //       errorType: 'HTTP_EXCEPTION',
  //     };
  //     // when
  //     await service.sendAlert(errorResponseBody);

  //     // then
  //     expect(true).toBe(true);
  //   }, 10000);
  // });
});
