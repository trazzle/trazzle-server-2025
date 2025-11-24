import { Injectable } from '@nestjs/common';
import { ITravelsRepository } from './travels.repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TravelRepositoryImpl implements ITravelsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getTravelNoteCountsByUserId(userId: number): Promise<number> {
    // 사용자가 작성한 여행기록 개수
    const result = await this.prisma.travels.count({
      where: {
        user_id: userId,
      },
    });
    return result;
  }
  //   async getVisitedCountriesByUserId(
  //     userId: number,
  //   ): Promise<{ visitedCountries: number; visitiedWorldPercentage: number }> {}
}
