import { applyDecorators } from '@nestjs/common';
import { ApiNotModifiedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function ApiGetTermsOfService() {
  return applyDecorators(
    ApiOperation({ summary: '서비스 이용약관 pdf 파일 조회 API' }),
    ApiOkResponse({
      description:
        '서비스 이용약관 pdf 파일 수정하거나 브라우저 캐싱이 만료될때 응답함. 바디데이터와 같이 응답',
    }),
    ApiNotModifiedResponse({
      description:
        '응답데이터 없음 - 브라우저 캐싱에 있는 서비스 이용약관 pdf파일의 버젼과 서버에 저장된 파일이 동일',
    }),
  );
}
