import { Injectable } from '@nestjs/common';
import { Role, Users } from '@prisma/client';
import { IUsersRepository } from './users.repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepositoryImpl implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: { name: string; email: string; role?: Role }): Promise<Users> {
    return await this.prisma.users.create({
      data: {
        name: params.name,
        email: params.email,
        role: params.role ?? Role.USER,
      },
    });
  }

  async findOneByEmail(email: string): Promise<Users | null> {
    return await this.prisma.users.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findOneById(id: number): Promise<Users | null> {
    return await this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });
  }

  async update(id: number, name: string, intro: string): Promise<Users> {
    return await this.prisma.users.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        intro: intro,
      },
    });
  }
  async delete(id: number): Promise<void> {
    await this.prisma.users.delete({
      where: {
        id: id,
      },
    });
  }
}
