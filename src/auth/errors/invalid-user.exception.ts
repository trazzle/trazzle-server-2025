import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidUserException extends HttpException {
  constructor() {
    super('인증된 사용자가 아닙니다', HttpStatus.UNAUTHORIZED);
  }
}
