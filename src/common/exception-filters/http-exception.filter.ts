import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { DiscordsService } from 'src/discords/discords.service';
import { generateErrorResponse } from './generate-error-response.function';

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionsFilter.name);
  constructor(private readonly discordAlertService: DiscordsService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const NODE_ENV = process.env.NODE_ENV || 'development';

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse.message ?? exceptionResponse)
        : exceptionResponse;

    const responseBody = generateErrorResponse({
      request,
      statusCode: status,
      message,
      errorType: 'HTTP_EXCEPTION',
    });

    this.logger.error(`[${responseBody.errorType}]: ${responseBody.message}`, exception.stack);
    // (운영 - production)에서 5xx 에러발생시 discord 메시지로 알림
    if (NODE_ENV === 'production' && status >= 500) {
      await this.discordAlertService.sendAlert(responseBody);
    }

    response.status(status).json(responseBody);
  }
}
