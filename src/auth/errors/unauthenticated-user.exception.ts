import { HttpException, HttpStatus } from '@nestjs/common';

export class UnAuthenticatedUserException extends HttpException {
  constructor() {
    super('인증되지 않은 사용자 입니다.', HttpStatus.UNAUTHORIZED);
  }
}
