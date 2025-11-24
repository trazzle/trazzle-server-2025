export const TRAVELS = Symbol('ITravelsRepository');
export interface ITravelsRepository {
  getTravelNoteCountsByUserId(userId: number): Promise<number>;
  // getVisitedCountriesByUserId(
  //   userId: number,
  // ): Promise<{ visitedCountries: number; visitiedWorldPercentage: number }>;
}
