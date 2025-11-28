import { Inject, Injectable } from '@nestjs/common';
import { IUsersRepository, USERS } from './users.repository.interface';
import { UserNotFoundException } from './errors/user-not-found.exception';
import { AwsS3Service } from '../aws/aws-s3.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS)
    private readonly userRepository: IUsersRepository,
    private readonly s3Service: AwsS3Service,
  ) {}

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOneByEmail(email);
    return user;
  }

  async findUserById(id: number) {
    const user = await this.userRepository.findOneById(id);
    if (!user) throw new UserNotFoundException();
    return user;
  }

  /**
   * 회원 탈퇴
   * @param id - 유저 고유 ID
   */
  async withdraw(id: number) {
    const user = await this.findUserById(id);
    if (!user) throw new UserNotFoundException();
    await this.userRepository.delete(id);
  }

  /**
   * 유저 정보 조회
   * @param id - 유저 고유 ID
   * @returns 회원정보(프로필 이미지, 소개문구)
   */
  async getMyInfo(id: number) {
    // 회원정보 조회 - 프로필 이미지, 소개문구
    const user = await this.userRepository.findOneById(id);
    if (!user) throw new UserNotFoundException();
    const { intro, profile_image_url } = user;

    return {
      intro: intro,
      profile_image: profile_image_url,
    };
  }

  /**
   * 회원정보 수정
   * @param dto
   * @param.id: (필수) 유저 고유 ID
   * @param.name : (선택)(수정) 이름
   * @param.intro: (선택)(수정) 소개문구
   * @param.profileImageFile: (선택)(수정) 프로필 이미지
   * @returns 수정된 회원정보
   */
  async update(dto: {
    id: number;
    name?: string;
    intro?: string;
    profileImageFile?: Express.Multer.File;
  }) {
    const { id, profileImageFile } = dto;
    // 프로필 이미지 S3 업로드
    let profileImageUrl: string | undefined = undefined;
    if (profileImageFile) {
      const folder = `${process.env.NODE_ENV || 'development'}/profiles/${id}`;
      profileImageUrl = await this.s3Service.uploadFile({
        file: profileImageFile,
        folder: folder,
      });
    }

    // 유저 정보 업데이트
    const updatedUser = await this.userRepository.update({
      id: dto.id,
      name: dto.name,
      intro: dto.intro,
      profileImageUrl: profileImageUrl,
    });

    return updatedUser;
  }
}
