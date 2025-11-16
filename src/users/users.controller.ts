import { Controller, Delete, Get, Patch, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('회원')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Get('me')
  @ApiOperation({ summary: '회원 정보 조회 API' })
  async myInfo() {}

  @Put('profile')
  @ApiOperation({ summary: '프로필 이미지 수정 API' })
  async updateProfile() {}

  @Patch('me')
  @ApiOperation({ summary: '회원 정보 수정 API' })
  async updateMyInfo() {}

  @Delete('withdraw')
  @ApiOperation({ summary: '회원 탈퇴 API' })
  async withdraw() {}
}
