import { PrismaClient } from '@prisma/client';
import { seedCountriesAndCities } from './seeds/country-and-city.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 데이터 Seeding을 시작합니다..!');
  // 국가 & 도시 초기데이터 셋팅
  await seedCountriesAndCities(prisma);

  console.log('🌱 데이터 Seeding을 완료하였습니다..!');
}

main()
  .catch((e) => {
    console.error(`Seeding Error:  ${e}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
