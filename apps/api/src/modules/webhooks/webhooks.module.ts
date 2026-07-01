import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { ConversationsModule } from '../conversations/conversations.module';
import { TransactionsModule } from '../financial/transactions/transactions.module';

@Module({
  imports: [ConversationsModule, TransactionsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
