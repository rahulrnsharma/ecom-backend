import { Body, Controller, Get, Post, Query, Put, Delete, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/decorator/role.decorator';
import { ScopeUser } from 'src/decorator/user.decorator';
import { BannerDto } from 'src/dto/banner.dto';
import { BannerTypeEnum } from 'src/enum/banner-type.enum';
import { RoleEnum } from 'src/enum/role.enum';
import { IContextUser } from 'src/interface/user.interface';
import { BannerService } from 'src/services/banner.service';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';
import { UtilityService } from 'src/services/utility.service';

@ApiTags('Banner')
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) { }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(FileInterceptor('image', UtilityService.multerOptions("banner", "banner", "image", 5 * 1024 * 1024)))
  async create(@Body() bannerDto: BannerDto, @ScopeUser() contextUser: IContextUser, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Image is required.");
    }
    return this.bannerService.create(bannerDto, contextUser, file?.filename);
  }
  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAll() {
    return this.bannerService.getAll();
  }
  @Get('by-type')
  @ApiQuery({ name: 'type', enum: Object.values(BannerTypeEnum) })
  async getByType(@Query('type') type: string) {
    return this.bannerService.getByType(type);
  }
  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiParam({ name: 'id' })
  async getById(@Param('id') id: string) {
    return this.bannerService.getById(id);
  }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiConsumes('multipart/form-data')
  @Put(':id')
  @ApiParam({ name: 'id' })
  @UseInterceptors(FileInterceptor('image', UtilityService.multerOptions("banner", "banner", "image", 2 * 1024 * 1024)))
  async update(@Param('id') id: string, @Body() bannerDto: BannerDto, @ScopeUser() contextUser: IContextUser, @UploadedFile() file: Express.Multer.File) {
    return this.bannerService.update(id, bannerDto, contextUser, file?.filename);
  }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiParam({ name: 'id' })
  async delete(@Param('id') id: string, @ScopeUser() contextUser: IContextUser) {
    return this.bannerService.delete(id, contextUser);
  }
}