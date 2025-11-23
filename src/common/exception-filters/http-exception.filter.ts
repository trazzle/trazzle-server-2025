import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { DiscordsService } from 'src/discords/discords.service';
import { generateErrorResponse } from './generate-error-response.function';

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionsFilter.name);
  private readonly ignoredPaths = [
    '/.well-known/appspecific/com.chrome.devtools.json',
    '/favicon.ico',
  ];
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

    // 무시할 경로는 로깅에서 제외
    if (this.ignoredPaths.includes(request.path)) {
      return response.status(status).json(responseBody);
    }

    // 로깅 레벨 지정
    if (status >= 500) {
      // 500번대 에러 (서버에러) - error 레벨 (즉시 대응 필요)
      this.logger.error(
        `[${status}] ${request.method} ${request.url} - ${exception.message}`,
        exception.stack,
      );
    } else if (status === 404) {
      // 404번 에러 - debug/info 로 정상적인 요청실패에 해당하므로 노이즈를 줄인다.
      this.logger.log(`[${status}] ${request.method} ${request.url} - ${exception.message}`);
    } else if (status >= 400) {
      // 400번대 에러 - warn 레벨로 하며 참고용으로 한다.
      this.logger.warn(`[${status}] ${request.method} ${request.url} - ${exception.message}`);
    }

    // (운영 - production)에서 5xx 에러발생시 discord 메시지로 알림
    if (NODE_ENV === 'production' && status >= 500) {
      await this.discordAlertService.sendAlert(responseBody);
    }
    response.status(status).json(responseBody);
  }
}
