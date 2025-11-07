import {
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class AwsS3Service {
  private s3Client: S3Client;
  private s3Bucket: string;
  private s3Region: string;
  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('app.s3Region') ?? '',
      credentials: {
        accessKeyId: this.configService.get<string>('app.awsAccessKey') ?? '',
        secretAccessKey: this.configService.get<string>('app.awsSecretAccessKey') ?? '',
      },
    });

    this.s3Bucket = this.configService.get<string>('app.s3BucketName') ?? '';
    this.s3Region = this.configService.get<string>('app.s3Region') ?? 'ap-northeast-2';
  }

  /**
   * 파일확장자 추출 프라이빗 함수
   * - 파일 확장자 추출.
   * - 원본파일의 확장자가 없으면 MIME 타입으로부터 확장자를 추출한다.
   * @param file - 업로드 파일
   * @returns 파일확장자
   */
  private getFileExtension(file: Express.Multer.File): string {
    const originalName = file.originalname;
    const ext = path.extname(originalName);

    if (!ext) {
      // 확장자가 없으면 MIME type으로부터 추출
      const mimeTypeMap: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/svg+xml': '.svg',
        'application/pdf': '.pdf',
      };
      return mimeTypeMap[file.mimetype] || '.bin';
    }

    return ext.toLowerCase();
  }

  /**
   * 단일 파일 업로드
   * - 활용: 프로필 이미지 변경
   * - 활용: 특정 도시 스페셜 마그넷 이미지 추가
   *
   * @param file    - 업로드 파일
   * @param folder  - s3 버킷 내 객체 경로 (파일 제외)
   * @returns 업로드 파일 s3 url
   */
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    // 파일 확장자 추출
    const ext = this.getFileExtension(file);
    const key = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const command = new PutObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    // s3 putObject 명령어 실행 -> s3 url 리턴
    await this.s3Client.send(command);
    return `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/${key}`;
  }

  /**
   * 여러개 파일 업로드
   * - 활용: 여행기 이미지 업로드 및 수정
   * - 활용: 특정 도시 스페셜 마그넷 이미지 여러개 추가
   *
   * @param files   - 파일 리스트
   * @param folder  - s3 버킷 내 객체 경로 (파일제외)
   * @returns 업로드 파일 s3 url 리스트
   */
  async uploadFiles(files: Express.Multer.File[], folder: string): Promise<string[]> {
    const uploadPromises = files.map((item) => this.uploadFile(item, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  }
  /**
   * key에 대응되는 파일 불러오기
   * - 활용: 개인정보 이용약관 pdf 파일 조회
   * - 활용: 서비스 이용약관 pdf 파일 조회
   * - 활용: 프로필 조회
   * - 활용: 여행 스토리 등록시 마그넷 1개 조회
   *
   * @param key - s3 버킷내 객체경로 (객체파일 포함)
   * @returns 버킷에 저장된 파일
   */
  async getFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      const byteArray = await response.Body?.transformToByteArray();
      if (!byteArray || byteArray.length === 0) {
        throw new Error('File is empty');
      }

      return Buffer.from(byteArray);
    } catch (error) {
      if (error instanceof NoSuchKey) {
        throw new NotFoundException(
          `Error from S3 while getting object "${key}" from "${this.s3Bucket}". No such key exists.`,
        );
      } else if (error instanceof S3ServiceException) {
        throw new InternalServerErrorException(
          `Error from S3 while getting object from ${this.s3Bucket}.  ${error.name}: ${error.message}`,
        );
      } else {
        throw error;
      }
    }
  }
  /**
   * 리스트 keys 대응되는 파일 여러개 불러오기
   * - 활용: 여행 스토리 상세조회
   * - 활용: 여행 스토리 등록 폼
   * - 활용: 여행 스토리 수정 폼
   * - 활용: 마그넷 조회
   *
   * @param keys - s3 버킷내 객체경로 리스트 (객체파일 포함)
   * @returns 버킷에 저장된 파일 리스트
   */
  async getFiles(keys: string[]): Promise<Buffer[]> {
    return Promise.all(keys.map((key) => this.getFile(key)));
  }
}
