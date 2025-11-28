import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TrazzleUser } from '../auth/trazzle-user.interface';
import { Request, Response } from 'express';
import { MyInfoResonseDto } from './dtos/my-info.dto';
import { UserTravelStatisticsService } from './user-statistics.service';
import { UpdateMyInfoRequestDto, UpdateMyInfoResponseDto } from './dtos/update-my-info.dto';
import { SwaggerApiPropertiesDescription } from '../common/decorators/swagger-api-properties-description.decorator';
import { UpdateProfileRequestDto, UpdateProfileResponseDto } from './dtos/update-profile.dto';

@ApiTags('회원')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly statisticService: UserTravelStatisticsService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: '회원 정보 조회 API' })
  @ApiOkResponse({ description: '성공 응답', type: MyInfoResonseDto })
  async myInfo(@CurrentUser() user: TrazzleUser, @Res() res: Response) {
    const userInfo = await this.userService.getMyInfo(user.id);
    return res.status(200).json(
      MyInfoResonseDto.of({
        id: user.id,
        name: user.name,
        intro: userInfo.intro,
        profile_image: userInfo.profile_image,
        travel_stories: 0,
        visited_countries: 0,
        visited_world_percentage: 0.01,
        magnets: 0,
      }),
    );
  }

  // @Get('me/travel-info')
  // @ApiOperation({ summary: '나의 여행 통계' })
  // @ApiOkResponse({ description: '성공 응답', type: MyTravelStatisticsResponseDto })
  // async myTravelStatistics(@CurrentUser() user: TrazzleUser, @Res() res: Response) {
  //   const result = await this.statisticService.getUserTravelStatistics(user.id);
  //   return res.status(HttpStatus.OK).json(
  //     MyTravelStatisticsResponseDto.of({
  //       travel_stories: result.travelStories ?? 0,
  //       visited_countries: result.visitedCountries ?? 0,
  //       visited_world_percentage: result.visitedWorldPercentage ?? 0.0,
  //     }),
  //   );
  // }

  @Put('profile')
  @ApiOperation({ summary: '프로필 이미지 수정 API' })
  @ApiBody({ type: UpdateProfileRequestDto })
  @SwaggerApiPropertiesDescription({ dto: UpdateProfileRequestDto })
  @ApiOkResponse({ description: '성공 응답', type: UpdateProfileResponseDto })
  async updateProfile(@CurrentUser() user: TrazzleUser, @Req() req: Request, @Res() res: Response) {
    const result = await this.userService.update({
      id: user.id,
      profileImageFile: req.file,
    });

    return res.status(HttpStatus.OK).json(
      UpdateProfileResponseDto.of({
        profile_image_url: result.profile_image_url,
      }),
    );
  }

  @Patch('me')
  @ApiOperation({ summary: '회원 정보 수정 (이름, 소개글) API' })
  @ApiBody({ type: UpdateMyInfoRequestDto })
  @SwaggerApiPropertiesDescription({ dto: UpdateMyInfoRequestDto })
  @ApiOkResponse({ description: '성공 응답', type: UpdateMyInfoResponseDto })
  async updateMyInfo(
    @CurrentUser() user: TrazzleUser,
    @Body() body: UpdateMyInfoRequestDto,
    @Res() res: Response,
  ) {
    const result = await this.userService.update({
      id: user.id,
      intro: body.intro,
      name: body.name,
    });

    return res.status(HttpStatus.OK).json(
      UpdateMyInfoResponseDto.of({
        name: result.name,
        intro: result.intro,
      }),
    );
  }

  @Delete('withdraw')
  @ApiOperation({ summary: '회원 탈퇴 API' })
  @ApiNoContentResponse({ description: '성공 응답' })
  async withdraw(@CurrentUser() user: TrazzleUser, @Req() req: Request, @Res() res: Response) {
    await this.userService.withdraw(user.id);
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
