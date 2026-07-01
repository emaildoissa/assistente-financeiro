import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, dto: CreateReminderDto) {
    return this.prisma.reminder.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description,
        remindAt: new Date(dto.remindAt),
        repeat: dto.repeat ?? 'none',
      },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.reminder.findMany({
      where: { tenantId },
      orderBy: { remindAt: 'asc' },
    });
  }

  async markSent(id: string) {
    return this.prisma.reminder.update({
      where: { id },
      data: { isSent: true, sentAt: new Date() },
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.reminder.deleteMany({ where: { id, tenantId } });
  }
}
