import { ConfigModuleOptions, ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const appConfig = registerAs('app', () => ({
  serverPort: process.env.SERVER_PORT!,
  // 데이터베이스
  databaseurl: process.env.DATABASE_URL!,
  // 토큰 (jwt)
}));
export type AppConfig = ConfigType<typeof appConfig>;

export const configModuleOptions = {
  isGlobal: true,
  envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
  validate: z.object({
    SERVER_PORT: z.coerce.number(),
    // 데이터베이스
    DATABASE_URL: z.string().min(1),
    // 토큰 (jwt)
    // REDIS
  }).parse,
  load: [appConfig],
} satisfies ConfigModuleOptions;
