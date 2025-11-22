import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidTokenException extends HttpException {
  constructor(message?: string) {
    super(message || '토큰이 유효하지 않습니다.', HttpStatus.UNAUTHORIZED);
  }
}
