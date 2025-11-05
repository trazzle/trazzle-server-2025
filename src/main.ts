import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';

async function bootstrap() {
  const logger = new Logger('Server');
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const app = await NestFactory.create(AppModule, {
    logger:
      NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'debug', 'error', 'warn', 'verbose'],
  });

  const configService = app.get<ConfigService>(ConfigService);
  const SERVER_PORT = configService.get<number>('SERVER_PORT') || 3000;

  // Global Validation Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Interceptor
  app.useGlobalInterceptors(new SuccessResponseInterceptor());

  // Exception Filter

  // REST API URI prefix - URI 맨앞에 'api' 를 붙임
  app.setGlobalPrefix('api');

  // CORS 설정
  const allowedOrigins = [
    // tbd: your-production-domain
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: NODE_ENV === 'production' ? allowedOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Trazzle Backend API')
    .setDescription('트래즐 백엔드 API 문서')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger-ui', app, swaggerDocument);

  await app.listen(SERVER_PORT, () =>
    logger.log(`🚀 Application Server is running on ${SERVER_PORT}`),
  );
}
bootstrap();
