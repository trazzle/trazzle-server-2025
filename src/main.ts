import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const SERVER_PORT = process.env.SERVER_PORT || 3000;
  const logger = new Logger('Server');

  const app = await NestFactory.create(AppModule, {
    logger:
      NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'debug', 'error', 'warn', 'verbose'],
  });

  // Global Validation Pipes
  // Interceptor
  // Exception Filter

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
