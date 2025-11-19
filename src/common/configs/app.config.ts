import { ConfigModuleOptions, ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const appConfig = registerAs('app', () => ({
  serverPort: process.env.SERVER_PORT!,
  // 데이터베이스
  databaseurl: process.env.DATABASE_URL!,
  // Redis
  redisUrl: process.env.REDIS_URL!,
  redisHost: process.env.REDIS_HOST!,
  redisPort: process.env.REDIS_PORT!,
  // aws credentials
  awsAccessKey: process.env.AWS_ACCESS_KEY_ID!,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  // aws (s3)
  s3Region: process.env.AWS_REGION!,
  s3BucketName: process.env.AWS_S3_BUCKET_NAME!,
  // discord webhook url
  discordWebhook: process.env.DISCORD_WEBHOOK_URL!,
  // 토큰 (jwt)
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiration: process.env.JWT_EXPIRATION!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION!,
  // KAKAO
  kakaoRedirectUri: process.env.KAKAO_REDIRECT_URI!,
  kakaoRestApiKey: process.env.KAKAO_REST_API_KEY!,
  kakaoClientSecretKey: process.env.KAKAO_CLIENT_SECRET_KEY!,
  // GOOGLE
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecretPassword: process.env.GOOGLE_CLIENT_SECRET_PASSWORD!,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI!,
}));
export type AppConfig = ConfigType<typeof appConfig>;

export const configModuleOptions = {
  isGlobal: true,
  envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
  validate: z.object({
    SERVER_PORT: z.coerce.number(),
    // 데이터베이스
    DATABASE_URL: z.string().min(1),
    // Redis
    REDIS_URL: z.string().min(1),
    REDIS_HOST: z.string().min(1),
    REDIS_PORT: z.coerce.number(),
    // 디스코드 장애 웹훅 URL
    DISCORD_WEBHOOK_URL: z.string().min(1),
    // aws credentials
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    // aws s3
    AWS_REGION: z.string().min(1),
    AWS_S3_BUCKET_NAME: z.string().min(1),
    // 토큰 (jwt)
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRATION: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),
    JWT_REFRESH_EXPIRATION: z.string().min(1),
    // KAKAO
    KAKAO_REDIRECT_URI: z.string().min(1),
    KAKAO_REST_API_KEY: z.string().min(1),
    KAKAO_CLIENT_SECRET_KEY: z.string().min(1),
    // GOOGLE
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET_PASSWORD: z.string().min(1),
    GOOGLE_REDIRECT_URI: z.string().min(1),
  }).parse,
  load: [appConfig],
} satisfies ConfigModuleOptions;
