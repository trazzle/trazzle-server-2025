import { Test, TestingModule } from '@nestjs/testing';
import { RedisCacheService } from './redis-cache.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { StartedTestContainer, GenericContainer } from 'testcontainers';
import Redis from 'ioredis';

describe('RedisService Integration Test', () => {
  let module: TestingModule;
  let service: RedisCacheService;
  let redisContainer: StartedTestContainer;

  beforeAll(async () => {
    redisContainer = await new GenericContainer('redis').withExposedPorts(6379).start();
    const redisHost = redisContainer.getHost();
    const redisPort = redisContainer.getMappedPort(6379);
    module = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          type: 'single',
          options: {
            host: redisHost,
            port: redisPort,
            enableReadyCheck: false,
            maxRetriesPerRequest: null,
          },
        }),
      ],
      providers: [RedisCacheService],
    }).compile();

    // 테스팅모듈에서 service 불러오기
    service = module.get<RedisCacheService>(RedisCacheService);

    // redis 연결될때까지 3초대기
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });
  afterEach(async () => {
    // 모든 캐시 데이터 삭제
    await service['redis'].flushdb();
  });
  afterAll(async () => {
    // redis 연결 종료
    if (service?.['redis']) await service['redis'].quit();
    // nestjs 모듈 종료
    if (module) await module.close();
    // 테스트컨테이너 종료
    if (redisContainer) await redisContainer.stop();

    if (service && 'quit' in service && typeof service.quit === 'function') {
      await service.quit(); // ioredis의 quit 메서드 호출
    }
  });

  describe('SET & GET', () => {
    it('should be set string value (string)', async () => {
      // given
      const key = 'set-test-1';
      const value = 'hello trazzle';
      await service.set(key, value);

      // when
      const result = await service.get<string>(key);
      // then
      expect(result).toBe(value);
      expect(typeof result).toBe('string');
    });
    it('should be set string value (number)', async () => {
      // given
      const key = 'set-test-2';
      const value = 1;
      await service.set(key, value);

      // redis모듈의 get메서드를 이용하여 저장된 value가 string 인지 확인
      // when
      const result = await service.get(key);
      // then
      expect(result).toBe(value);
      expect(typeof result).toBe('number');
    });
    it('should be set Object value', async () => {
      // given
      const key = 'set-test-3';
      const value = {
        name: 'trazzle',
        description: '세계여행 기록 서비스',
        date: new Date(),
      };
      await service.set(key, value);

      // redis모듈의 get메서드를 이용하여 저장된 value가 object인지 확인
      // when
      const result = await service.get<typeof value>(key);

      // then
      expect(typeof result).toBe('object');
      expect(result?.name).toBe('trazzle');
      expect(result?.description).toBe('세계여행 기록 서비스');
      expect(typeof result?.date).toBe('string');
    });
  });
});
