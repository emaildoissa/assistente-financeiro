import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByTenant(tenantId: string) {
    return this.prisma.user.findMany({
      where: { memberships: { some: { tenantId } } },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
