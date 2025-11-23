import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface ICountryAndCity {
  id: string; // country code (unique)
  name_y: string; // country_name_y (국가명)
  region: string; // continent (대륙명)
  translations: {
    kr: string; // name_kr (국가 한국명)
  };
  cities: {
    name: string; // 도시 이름(영어)
    name_kr?: string; // (한글, 한국내 도시 & 특별마그넷) 도시 한국명
    latitude: string; // 도시 위도
    longitude: string; // 도시 경도
  }[];
}

export async function seedCountriesAndCities(prisma: PrismaClient) {
  console.log('🌏 Country(국가) & City(도시) 데이터 Seeding 시작합니다. \n');

  // JSON파일 열기
  const jsonPath = path.join(__dirname, '../country-city-data/countrycity.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data: ICountryAndCity[] = JSON.parse(rawData);

  let countryCount = 0;
  let cityCount = 0;
  for (const item of data) {
    try {
      // 1. Country 데이터 upsert 중복방지
      const country = await prisma.countries.upsert({
        where: { code: item.id },
        update: {
          code: item.id,
          name: item.name_y,
          name_kr: item.translations.kr,
          continent: item.region,
        },
        create: {
          code: item.id,
          name: item.name_y,
          name_kr: item.translations.kr,
          continent: item.region,
        },
      });
      countryCount++;

      // 2. City 생성
      if (item.cities && Array.isArray(item.cities) && item.cities.length > 0) {
        for (const cityData of item.cities) {
          const existingCity = await prisma.cities.findFirst({
            where: {
              name: cityData.name,
              latitude: cityData.latitude,
              longitude: cityData.longitude,
              country_code: country.code,
            },
          });
          if (!existingCity) {
            await prisma.cities.create({
              data: {
                name: cityData.name,
                name_kr: cityData.name_kr ?? null,
                latitude: cityData.latitude,
                longitude: cityData.longitude,
                country_code: country.code,
              },
            });
            cityCount++;
          }
        }
      }
      if (countryCount % 50 === 0) {
        console.log(`✅ 현재까지 생성 완료된 국가: ${countryCount} 개, 도시: ${cityCount} 개 ...`);
      }
    } catch (error) {
      console.log(`❌ ${item.id} ${item.name_y} 데이터 Seeding 중 Error 발생: ${error}`);
    }
  }
}
