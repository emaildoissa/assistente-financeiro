import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { ConversationsModule } from '../conversations/conversations.module';
import { TransactionsModule } from '../financial/transactions/transactions.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [ConversationsModule, TransactionsModule, AiModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
