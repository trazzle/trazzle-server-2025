import { TrazzleUser } from "../auth/trazzle-user.interface";

export const USERS_CACHE = Symbol('IUsersCacheRepository');
export interface IUsersCacheRepository {
  getUserAccessToken(id: number): Promise<any>;
  setUserAccessToken(id: number, value: any): Promise<void>;
  delUserAccessToken(id: number): Promise<void>;

  getUserRefreshToken(id: number): Promise<any>;
  setUserRefreshToken(id: number, value: any): Promise<void>;
  delUserRefreshToken(id: number): Promise<void>;

  getSignInUserInfo(accessToken: string): Promise<any>;
  setSignInUserInfo(accessToken: string, value: TrazzleUser): Promise<void>;
}

export const USER_ACCESS_TOKEN_KEY = (id: number): string => `trazzle:users:${id}:access_token`;
export const USER_REFRESH_TOKEN_KEY = (id: number): string => `trazzle:users:${id}:refresh_token`;

export const SIGN_IN_USERINFO_KEY = (accessToken: string): string =>
  `trazzle:tokens:${accessToken}`;
