import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  async addMember(tenantId: string, email: string, role: 'admin' | 'member' = 'member') {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new ConflictException('User not found');

    const existing = await this.prisma.membership.findUnique({
      where: { tenantId_userId: { tenantId, userId: user.id } },
    });
    if (existing) throw new ConflictException('User already a member');

    return this.prisma.membership.create({
      data: { tenantId, userId: user.id, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async removeMember(tenantId: string, userId: string) {
    return this.prisma.membership.delete({
      where: { tenantId_userId: { tenantId, userId } },
    });
  }

  async listMembers(tenantId: string) {
    return this.prisma.membership.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
  }
}
