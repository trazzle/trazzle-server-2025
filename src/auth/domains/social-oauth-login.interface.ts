export interface ISocialOAuthLogin {
  getAuthenticateURL(): string; // 로그인화면 URL 요청
  requestAccessToken(); // 소셜 계정 액세스토큰 요청
  requestUserInfo(); // 소셜 로그인 계정 유저정보(이름, 이메일)
  signIn(); // 로그인
}
