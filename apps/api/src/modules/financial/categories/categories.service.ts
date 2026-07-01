import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCategoryDto) {
    return this.prisma.financialCategory.create({
      data: { ...dto, tenantId },
    });
  }

  async findAll(tenantId: string, type?: string) {
    const where: any = { tenantId };
    if (type) where.type = type;
    return this.prisma.financialCategory.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { children: true },
    });
  }

  async findOne(id: string, tenantId: string) {
    const cat = await this.prisma.financialCategory.findFirst({
      where: { id, tenantId },
      include: { children: true },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async update(id: string, tenantId: string, dto: UpdateCategoryDto) {
    await this.findOne(id, tenantId);
    return this.prisma.financialCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.financialCategory.delete({ where: { id } });
  }
}
