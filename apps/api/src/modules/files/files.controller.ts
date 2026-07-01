import {
  Controller, Get, Post, Delete, Param, Query, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { CurrentTenant } from '../../core/tenant/tenant.decorator';
import { CurrentUser } from '../../core/auth/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('files')
export class FilesController {
  constructor(private service: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentTenant('id') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Query('transactionId') transactionId?: string,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return this.service.create(
      tenantId,
      userId,
      file.originalname,
      file.path || file.buffer.toString(),
      file.mimetype,
      file.size,
      transactionId,
    );
  }

  @Get()
  findAll(
    @CurrentTenant('id') tenantId: string,
    @Query('transactionId') transactionId?: string,
  ) {
    return this.service.findAll(tenantId, transactionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant('id') tenantId: string) {
    return this.service.findOne(id, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant('id') tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
