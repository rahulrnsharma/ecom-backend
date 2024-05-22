import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/decorator/role.decorator';
import { ScopeUser } from 'src/decorator/user.decorator';
import { BrandDto, SearchBrandDto } from 'src/dto/brand.dto';
import { RoleEnum } from 'src/enum/role.enum';
import { IContextUser } from 'src/interface/user.interface';
import { BrandService } from 'src/services/brand.service';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';
import { UtilityService } from 'src/services/utility.service';

@ApiTags('Brand')
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(FileInterceptor('image', UtilityService.multerOptions("brand", "brand", "image", 2 * 1024 * 1024)))
  async create(@Body() brandDto: BrandDto, @ScopeUser() contextUser: IContextUser, @UploadedFile() file: Express.Multer.File) {
    return this.brandService.create(brandDto, contextUser, file?.filename);
  }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAll(@Query() query: SearchBrandDto) {
    return this.brandService.getAll(query);
  }
  @Get('dropdown')
  async dropdown() {
    return await this.brandService.dropdown();
  }
  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiParam({ name: 'id' })
  async getById(@Param('id') id: string) {
    return this.brandService.getById(id);
  }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiConsumes('multipart/form-data')
  @Put(':id')
  @ApiParam({ name: 'id' })
  @UseInterceptors(FileInterceptor('image', UtilityService.multerOptions("brand", "brand", "image", 2 * 1024 * 1024)))
  async update(@Param('id') id: string, @Body() brandDto: BrandDto, @ScopeUser() contextUser: IContextUser, @UploadedFile() file: Express.Multer.File) {
    return this.brandService.update(id, brandDto, contextUser, file?.filename);
  }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiParam({ name: 'id' })
  async delete(@Param('id') id: string, @ScopeUser() contextUser: IContextUser) {
    return this.brandService.delete(id, contextUser);
  }
}