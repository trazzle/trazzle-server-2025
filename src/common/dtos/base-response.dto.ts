import { plainToInstance } from 'class-transformer';

type ClassConstructor<T> = { new (...args: any[]): T };

export abstract class ExposeAllBaseResponseDto {
  static of<T>(this: ClassConstructor<T>, data: Partial<T>): T {
    return plainToInstance(this, data, { excludeExtraneousValues: true });
  }
}
