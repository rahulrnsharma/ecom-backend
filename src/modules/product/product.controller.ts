import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards, Query, UseInterceptors, UploadedFiles, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/decorator/role.decorator';
import { ScopeUser } from 'src/decorator/user.decorator';
import { TimezoneDto } from 'src/dto/pagination.dto';
import { AdminSearchProductDto, ExcelFileDto, ProductDto, ProductImageDto, SearchProductDto } from 'src/dto/product.dto';
import { ReviewDto } from 'src/dto/review.dto';
import { RoleEnum } from 'src/enum/role.enum';
import { IContextUser } from 'src/interface/user.interface';
import { FirbaseAuthGuard } from 'src/services/guard/firebase.guard';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';
import { ProductService } from 'src/services/product.service';
import { UtilityService } from 'src/services/utility.service';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
  ) { }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Body() productDto: ProductDto, @ScopeUser() contextUser: IContextUser) {
    return this.productService.create(productDto, contextUser);
  }
  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('upload/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('gallery', 10, UtilityService.multerOptions("product", "product", "", 10 * 1024 * 1024)))
  @ApiParam({ name: 'id' })
  async uploadProductImage(@Param('id') id: string, @Body() productImageDto: ProductImageDto, @ScopeUser() contextUser: IContextUser, @UploadedFiles() files: Array<Express.Multer.File>) {
    return this.productService.uploadProductImage(id, contextUser, (files || []).map(ele => { return { image: `${ele.filename}` } }));
  }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('excel/verify')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('excel', UtilityService.excelFileFilter()))
  async uploadVerify(@Body() excelFileDto: ExcelFileDto, @ScopeUser() contextUser: IContextUser, @UploadedFile() file: Express.Multer.File) {
    return this.productService.uploadVerify(file);
  }

  @HasRoles(RoleEnum.USER)
  @ApiBearerAuth()
  @UseGuards(FirbaseAuthGuard, RolesGuard)
  @Get('search')
  async search(@Query() query: SearchProductDto) {
    return this.productService.search(query);
  }

  @HasRoles(RoleEnum.USER)
  @ApiBearerAuth()
  @UseGuards(FirbaseAuthGuard, RolesGuard)
  @Get('home')
  async home(@Query() query: TimezoneDto) {
    return this.productService.home(query);
  }

  @HasRoles(RoleEnum.USER)
  @ApiBearerAuth()
  @UseGuards(FirbaseAuthGuard, RolesGuard)
  @Get('autocomplete')
  async autocomplete(@Query('search') search: string) {
    return this.productService.autocomplete(search);
  }
  @HasRoles(RoleEnum.USER)
  @ApiBearerAuth()
  @UseGuards(FirbaseAuthGuard, RolesGuard)
  @Get('detail/:id')
  @ApiParam({ name: 'id' })
  async detail(@Param('id') id: string, @Query() query: TimezoneDto) {
    return this.productService.detail(id, query.timezone);
  }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('excel/sample')
  async getExcelSample(@ScopeUser() contextUser: IContextUser) {
    return this.productService.getExcelSample();
  }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAll(@Query() query: AdminSearchProductDto) {
    return this.productService.getAll(query);
  }
  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiParam({ name: 'id' })
  async getById(@Param('id') id: string) {
    return this.productService.getById(id);
  }
  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/:id/gallery')
  @ApiParam({ name: 'id' })
  async getProductImagesAdmin(@Param('id') id: string) {
    return this.productService.getProductImages(id);
  }
  @HasRoles(RoleEnum.USER)
  @ApiBearerAuth()
  @UseGuards(FirbaseAuthGuard, RolesGuard)
  @Get(':id/gallery')
  @ApiParam({ name: 'id' })
  async getProductImages(@Param('id') id: string) {
    return this.productService.getProductImages(id);
  }

  @HasRoles(RoleEnum.USER)
  @ApiBearerAuth()
  @UseGuards(FirbaseAuthGuard, RolesGuard)
  @Get(':id/review')
  @ApiParam({ name: 'id' })
  async getProductReview(@Param('id') id: string, @ScopeUser() contextUser: IContextUser) {
    return this.productService.getReview(id, contextUser);
  }
  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/:id/review')
  @ApiParam({ name: 'id' })
  async getProductReviewAdmin(@Param('id') id: string, @ScopeUser() contextUser: IContextUser) {
    return this.productService.getReview(id, contextUser);
  }

  @HasRoles(RoleEnum.USER)
  @ApiBearerAuth()
  @UseGuards(FirbaseAuthGuard, RolesGuard)
  @Put(':id/review')
  @ApiParam({ name: 'id' })
  async review(@Param('id') id: string, @Body() reviewDto: ReviewDto, @ScopeUser() contextUser: IContextUser) {
    return this.productService.review(id, reviewDto, contextUser);
  }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() productDto: ProductDto, @ScopeUser() contextUser: IContextUser) {
    return this.productService.update(id, productDto, contextUser);
  }

  @HasRoles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiParam({ name: 'id' })
  async delete(@Param('id') id: string, @ScopeUser() contextUser: IContextUser) {
    return this.productService.delete(id, contextUser);
  }

}