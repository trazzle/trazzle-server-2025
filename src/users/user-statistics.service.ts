import { Inject, Injectable } from '@nestjs/common';
import { TravelRepositoryImpl } from 'src/travels/travel.repository';
import { TRAVELS } from 'src/travels/travels.repository.interface';

@Injectable()
export class UserTravelStatisticsService {
  constructor(
    @Inject(TRAVELS)
    private readonly travelRepository: TravelRepositoryImpl,
  ) {}

  // async getUserTravelStatistics(id: number) {
  //   return {
  //     travelStories: 0,
  //     visitedCountries: 0,
  //     visitedWorldPercentage: 0,
  //   };
  // }
}
