import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { Request, Response } from 'express';
import { PublicAPI } from 'src/common/decorators/public-api.decorator';
import { AwsS3Service } from '../aws/aws-s3.service';
import { ApiGetTermsOfPersonalInformation } from './decorators/api-get-terms-of-personal-information.decorator';
import { ApiGetTermsOfService } from './decorators/api-get-terms-of-service.decorator';
import { TERMS_OF_PERSONAL_INFO_KEY, TERMS_OF_SERVICE_KEY } from './policies.key';

@ApiTags('이용약관')
@PublicAPI()
@Controller('policies')
export class PoliciesController {
  constructor(private readonly awsS3BucketService: AwsS3Service) {}
  /**
   * 서비스 이용약관 pdf 파일 조회 요청
   */
  @Get('terms-of-service')
  @ApiGetTermsOfService()
  async getTermsOfService(@Req() req: Request, @Res() res: Response) {
    // S3에서 파일 조회 (성능최적화를 해야된다면 서비스단을 만들어서 redis 캐시까지 고려..)
    const file = await this.awsS3BucketService.getFile(TERMS_OF_SERVICE_KEY);

    // 파일 내용으로 eTag 생성하고 MD5 해싱알고리즘으로 암호화
    const etag = `"${crypto.createHash('md5').update(file).digest('hex')}"`;

    // 클라이언트가 보낸 If-None-Match와 비교한다.
    const clientEtag = req.headers['if-none-match'];

    // 서버와 클라이언트의 eTag가 일치하면 -> 304 Not Modified 응답 (캐싱 유효시간 7일)
    if (etag === clientEtag) {
      return res
        .status(HttpStatus.NOT_MODIFIED)
        .setHeader('ETag', etag)
        .setHeader('Cache-Control', 'public, max-age=604800')
        .end();
    }

    // 최초요청이거나 eTag가 다르면 -> 200 OK와 파일전송 (캐싱 유효시간 7일)
    return res
      .status(HttpStatus.OK)
      .setHeader('Content-Type', 'application/pdf')
      .setHeader('Content-Disposition', 'inline; filename="terms-of-service.pdf"')
      .setHeader('ETag', etag)
      .setHeader('Cache-Control', 'public, max-age=604800')
      .send(file);
  }

  /**
   * 개인정보 이용약관 pdf 파일 조회 요청
   */
  @Get('terms-of-personal-info')
  @ApiGetTermsOfPersonalInformation()
  async getTermsOfPersonalInformation(@Req() req: Request, @Res() res: Response) {
    // S3에서 파일 조회
    const file = await this.awsS3BucketService.getFile(TERMS_OF_PERSONAL_INFO_KEY);

    // 파일 내용으로 eTag 생성하고 MD5 해싱알고리즘으로 암호화
    const etag = `"${crypto.createHash('md5').update(file).digest('hex')}"`;

    // 클라이언트가 보낸 If-None-Match와 비교한다.
    const clientEtag = req.headers['if-none-match'];

    // 서버와 클라이언트의 eTag가 일치하면 -> 304 Not Modified 응답
    if (etag === clientEtag) {
      return res
        .status(HttpStatus.NOT_MODIFIED)
        .setHeader('ETag', etag)
        .setHeader('Cache-Control', 'public, max-age=604800')
        .end();
    }
    // 최초요청이거나 eTag가 다르면 -> 200 OK와 파일전송
    return res
      .status(HttpStatus.OK)
      .setHeader('Content-Type', 'application/pdf')
      .setHeader('Content-Disposition', 'inline; filename="terms-of-personal-information.pdf"')
      .setHeader('ETag', etag)
      .setHeader('Cache-Control', 'public, max-age=604800')
      .send(file);
  }
}
