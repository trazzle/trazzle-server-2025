import { Inject, Injectable } from '@nestjs/common';
import { IUsersRepository, USERS } from './users.repository.interface';
import { UserNotFoundException } from './errors/user-not-found.exception';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS)
    private readonly userRepository: IUsersRepository,
  ) {}

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOneByEmail(email);
    return user;
  }

  async findUserById(id: number) {
    const user = await this.userRepository.findOneById(id);
    if (!user) throw new UserNotFoundException();
    return user;
  }

  async withdraw(id: number) {
    await this.userRepository.delete(id);
  }
}
