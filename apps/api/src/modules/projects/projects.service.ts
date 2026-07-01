import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: { ...dto, tenantId } as any,
    });
  }

  findAll(tenantId: string) {
    return this.prisma.project.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async findOne(id: string, tenantId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId },
      include: { tasks: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, tenantId: string, dto: Partial<CreateProjectDto>) {
    await this.findOne(id, tenantId);
    return this.prisma.project.update({ where: { id }, data: dto as any });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.project.delete({ where: { id } });
  }
}
