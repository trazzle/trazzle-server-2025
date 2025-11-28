import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor() {
    super('존재하지 않은 사용자 입니다.', HttpStatus.NOT_FOUND);
  }
}
