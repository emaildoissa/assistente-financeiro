import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: { ...dto, tenantId } as any,
    });
  }

  findAll(tenantId: string, status?: string) {
    const where: any = { tenantId };
    if (status) where.status = status;
    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { project: { select: { id: true, name: true, color: true } } },
    });
  }

  async findOne(id: string, tenantId: string) {
    const task = await this.prisma.task.findFirst({ where: { id, tenantId } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, tenantId: string, dto: Partial<CreateTaskDto>) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.status === 'done') data.completedAt = new Date();
    return this.prisma.task.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.task.delete({ where: { id } });
  }
}
