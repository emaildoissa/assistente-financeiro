import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { EvolutionService } from './evolution.service';
import { ConversationsModule } from '../conversations/conversations.module';
import { TransactionsModule } from '../financial/transactions/transactions.module';
import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [ConversationsModule, TransactionsModule, AiModule, PrismaModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, EvolutionService],
})
export class WebhooksModule {}
