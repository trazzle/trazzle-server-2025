import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { generateErrorResponse } from 'src/common/exception-filters/generate-error-response.function';

@Catch()
export class IORedisExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(IORedisExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Interner Server Error';
    let error = 'Internal Server Error';

    // Redis 연결 에러
    if (exception.name === 'ConnectionError' || exception.code === 'ECONNREFUSED') {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Redis connection failed';
      error = 'REDIS_CONNECTION_ERROR';
    }
    // Redis 타임아웃 에러
    else if (exception.name === 'TimeoutError' || exception.code === 'ETIMEDOUT') {
      status = HttpStatus.GATEWAY_TIMEOUT;
      message = 'Redis operation timeout';
      error = 'REDIS_TIMEOUT_ERROR';
    }
    // Redis 명령 실패
    else if (exception.name === 'ReplyError' || exception.message?.includes('WRONGTYPE')) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message || 'Invalid Redis command';
      error = 'REDIS_COMMAND_ERROR';
    }
    // Redis 파싱 에러
    else if (exception.name === 'ParsingError') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Redis response parsing error';
      error = 'REDIS_PARSING_ERROR';
    }
    // Redis 일반 에러
    else if (exception.message?.includes('Redis')) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      error = 'REDIS_ERROR';
    }

    const responseBody = generateErrorResponse({
      request,
      statusCode: status,
      message,
      errorType: 'REDIS_EXCEPTION',
      error,
    });

    this.logger.error(`[${responseBody.errorType}]: ${responseBody.message}`, exception.stack);
    response.status(status).json(responseBody);
  }
}
