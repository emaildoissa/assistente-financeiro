import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    userId: string | undefined,
    originalName: string,
    storedPath: string,
    mimeType: string,
    sizeBytes: number,
    transactionId?: string,
  ) {
    return this.prisma.file.create({
      data: {
        tenantId,
        userId,
        transactionId,
        originalName,
        storedPath,
        mimeType,
        sizeBytes,
      },
    });
  }

  findAll(tenantId: string, transactionId?: string) {
    const where: any = { tenantId };
    if (transactionId) where.transactionId = transactionId;
    return this.prisma.file.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const file = await this.prisma.file.findFirst({ where: { id, tenantId } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.file.delete({ where: { id } });
  }
}
