import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExists extends HttpException {
  constructor(email: string) {
    super(`해당 ${email} 계정의 유저는 이미 존재합니다.`, HttpStatus.CONFLICT);
  }
}
