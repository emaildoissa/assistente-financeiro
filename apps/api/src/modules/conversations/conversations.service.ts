import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(
    tenantId: string,
    instanceId: string,
    userPhone: string,
    userName?: string,
  ) {
    let conv = await this.prisma.conversation.findFirst({
      where: { tenantId, userPhone, status: 'active' },
    });

    if (!conv) {
      conv = await this.prisma.conversation.create({
        data: { tenantId, instanceId, userPhone, userName },
      });
    }

    return conv;
  }

  async addMessage(
    conversationId: string,
    tenantId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    options?: { type?: string; intent?: string; entities?: any; rawResponse?: any },
  ) {
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return this.prisma.message.create({
      data: {
        conversationId,
        tenantId,
        role,
        content,
        type: options?.type ?? 'text',
        intent: options?.intent,
        entities: options?.entities,
        rawResponse: options?.rawResponse,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.conversation.findMany({
      where: { tenantId },
      orderBy: { lastMessageAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    });
  }

  async findOne(id: string, tenantId: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id, tenantId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }
}
