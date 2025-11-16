import { Test, TestingModule } from '@nestjs/testing';
import { PoliciesController } from './policies.controller';
import { AwsS3Service } from '../aws/aws-s3.service';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { TERMS_OF_PERSONAL_INFO_KEY, TERMS_OF_SERVICE_KEY } from './policies.key';

describe('PoliciesController', () => {
  let controller: PoliciesController;
  let awsS3Service: AwsS3Service;

  const mockAwsS3Service = {
    getFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoliciesController],
      providers: [
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
        },
      ],
    }).compile();

    controller = module.get<PoliciesController>(PoliciesController);
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTermsOfService', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockPdfBuffer: Buffer;
    let expectedEtag: string;

    beforeEach(() => {
      // 테스트용 PDF 버퍼 생성
      mockPdfBuffer = Buffer.from('mock-terms-of-service-pdf-content');

      // 예상되는 ETag 계산
      expectedEtag = `"${crypto.createHash('md5').update(mockPdfBuffer).digest('hex')}"`;

      mockRequest = {
        headers: {},
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      mockAwsS3Service.getFile.mockResolvedValue(mockPdfBuffer);
    });

    it('최초 요청 시 200 OK와 함께 PDF 파일을 반환한다', async () => {
      // when
      await controller.getTermsOfService(mockRequest as Request, mockResponse as Response);

      // then
      expect(awsS3Service.getFile).toHaveBeenCalledWith(TERMS_OF_SERVICE_KEY);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'inline; filename="terms-of-service.pdf"',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('ETag', expectedEtag);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=604800',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockPdfBuffer);
    });

    it('클라이언트 ETag가 서버 ETag와 일치하면 304 Not Modified를 반환한다', async () => {
      // given
      mockRequest.headers = {
        'if-none-match': expectedEtag,
      };

      // when
      await controller.getTermsOfService(mockRequest as Request, mockResponse as Response);

      // then
      expect(awsS3Service.getFile).toHaveBeenCalledWith(TERMS_OF_SERVICE_KEY);
      expect(mockResponse.status).toHaveBeenCalledWith(304);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('ETag', expectedEtag);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=604800',
      );
      expect(mockResponse.end).toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
    });

    it('클라이언트 ETag가 다르면 200 OK와 함께 새 파일을 반환한다', async () => {
      // given
      mockRequest.headers = {
        'if-none-match': '"old-etag-value"',
      };

      // when
      await controller.getTermsOfService(mockRequest as Request, mockResponse as Response);

      // then
      expect(awsS3Service.getFile).toHaveBeenCalledWith(TERMS_OF_SERVICE_KEY);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('ETag', expectedEtag);
      expect(mockResponse.send).toHaveBeenCalledWith(mockPdfBuffer);
      expect(mockResponse.end).not.toHaveBeenCalled();
    });
  });

  describe('getTermsOfPersonalInformation', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockPdfBuffer: Buffer;
    let expectedEtag: string;

    beforeEach(() => {
      // 테스트용 PDF 버퍼 생성
      mockPdfBuffer = Buffer.from('mock-terms-of-personal-info-pdf-content');

      // 예상되는 ETag 계산
      expectedEtag = `"${crypto.createHash('md5').update(mockPdfBuffer).digest('hex')}"`;

      mockRequest = {
        headers: {},
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      mockAwsS3Service.getFile.mockResolvedValue(mockPdfBuffer);
    });

    it('최초 요청 시 200 OK와 함께 PDF 파일을 반환한다', async () => {
      // when
      await controller.getTermsOfPersonalInformation(
        mockRequest as Request,
        mockResponse as Response,
      );

      // then
      expect(awsS3Service.getFile).toHaveBeenCalledWith(TERMS_OF_PERSONAL_INFO_KEY);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'inline; filename="terms-of-personal-information.pdf"',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('ETag', expectedEtag);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=604800',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockPdfBuffer);
    });

    it('클라이언트 ETag가 서버 ETag와 일치하면 304 Not Modified를 반환한다', async () => {
      // given
      mockRequest.headers = {
        'if-none-match': expectedEtag,
      };

      // when
      await controller.getTermsOfPersonalInformation(
        mockRequest as Request,
        mockResponse as Response,
      );

      // then
      expect(awsS3Service.getFile).toHaveBeenCalledWith(TERMS_OF_PERSONAL_INFO_KEY);
      expect(mockResponse.status).toHaveBeenCalledWith(304);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('ETag', expectedEtag);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=604800',
      );
      expect(mockResponse.end).toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
    });

    it('클라이언트 ETag가 다르면 200 OK와 함께 새 파일을 반환한다', async () => {
      // given
      mockRequest.headers = {
        'if-none-match': '"old-etag-value"',
      };

      // when
      await controller.getTermsOfPersonalInformation(
        mockRequest as Request,
        mockResponse as Response,
      );

      // then
      expect(awsS3Service.getFile).toHaveBeenCalledWith(TERMS_OF_PERSONAL_INFO_KEY);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('ETag', expectedEtag);
      expect(mockResponse.send).toHaveBeenCalledWith(mockPdfBuffer);
      expect(mockResponse.end).not.toHaveBeenCalled();
    });
  });
});
