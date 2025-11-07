import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch(PrismaClientValidationError, PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(
    exception: PrismaClientValidationError | PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let error = 'Internal Server Error';

    if (exception instanceof PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation Error';
      error = exception.message;
    }

    if (exception instanceof PrismaClientKnownRequestError) {
      switch (exception.code) {
        // 필수 관계 대상을 찾을 수 없음 (404)
        case 'P2001':
          status = HttpStatus.NOT_FOUND;
          message = 'Required relation record not found';
          error = 'RELATION_NOT_FOUND';
          break;
        // 고유 제약조건 위반 (409)
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = `${exception.meta?.target} already exists`;
          error = 'UNIQUE_CONSTRAINT_VIOLATION';
          break;
        // 외래 키 제약 조건 위반 (400)
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = `Invalid value for field: ${exception.meta?.field_name}`;
          error = 'FOREIGN_KEY_CONSTRAINT_FAILED';
          break;
        // 레코드를 찾을 수 없음 (404)
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          error = 'RECORD_NOT_FOUND';
          break;
        // 트랜잭션 충돌 (409)
        case 'P2034':
          status = HttpStatus.CONFLICT;
          message = 'Transaction conflict detected';
          error = 'TRANSACTION_CONFLICT';
          break;
        // 기본
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = exception.message;
          error = exception.code;
      }
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
