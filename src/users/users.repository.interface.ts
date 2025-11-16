import { Role, Users } from '@prisma/client';

export const USERS = Symbol('IUsersRepository');
export interface IUsersRepository {
  create(params: { name: string; email: string; role?: Role }): Promise<Users>;
  findOneByEmail(email: string): Promise<Users | null>;
  findOneById(id: number): Promise<Users | null>;
  update(id: number, name: string, intro: string): Promise<Users>;
  delete(id: number): Promise<void>;
}
