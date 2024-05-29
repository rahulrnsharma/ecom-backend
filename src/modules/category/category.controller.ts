import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/decorator/role.decorator';
import { ScopeUser } from 'src/decorator/user.decorator';
import { CategoryDto, HomeCategoryDto, SearchCategoryDto } from 'src/dto/category.dto';
import { RoleEnum } from 'src/enum/role.enum';
import { IContextUser } from 'src/interface/user.interface';
import { CategoryService } from 'src/services/category.service';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';
import { UtilityService } from 'src/services/utility.service';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) { }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(FileInterceptor('image', UtilityService.multerOptions("category", "category", "image", 2 * 1024 * 1024)))
  async create(@Body() categoryDto: CategoryDto, @ScopeUser() contextUser: IContextUser, @UploadedFile() file: Express.Multer.File) {
    return this.categoryService.create(categoryDto, contextUser, file?.filename);
  }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAll(@Query() query: SearchCategoryDto) {
    return this.categoryService.getAll(query);
  }
  @Get('dropdown')
  async dropdown() {
    return this.categoryService.dropdown(false);
  }
  @Get('main/dropdown')
  async parentDropdown() {
    return this.categoryService.dropdown(true);
  }
  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiParam({ name: 'id' })
  async getById(@Param('id') id: string) {
    return this.categoryService.getById(id);
  }
  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/home')
  @ApiParam({ name: 'id' })
  async home(@Param('id') id: string, @Body() homeCategoryDto: HomeCategoryDto, @ScopeUser() contextUser: IContextUser) {
    return this.categoryService.updateHome(id, homeCategoryDto.home, contextUser);
  }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiConsumes('multipart/form-data')
  @Put(':id')
  @UseInterceptors(FileInterceptor('image', UtilityService.multerOptions("category", "category", "image", 2 * 1024 * 1024)))
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() categoryDto: CategoryDto, @ScopeUser() contextUser: IContextUser, @UploadedFile() file: Express.Multer.File) {
    return this.categoryService.update(id, categoryDto, contextUser, file?.filename);
  }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiParam({ name: 'id' })
  async delete(@Param('id') id: string, @ScopeUser() contextUser: IContextUser) {
    return this.categoryService.delete(id, contextUser);
  }
}