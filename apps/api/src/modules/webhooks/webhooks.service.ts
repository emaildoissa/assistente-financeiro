import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConversationsService } from '../conversations/conversations.service';
import { TransactionsService } from '../financial/transactions/transactions.service';
import { PrismaService } from '../../prisma/prisma.service';

interface TypebotPayload {
  tenantId?: string;
  instanceId?: string;
  instanceName?: string;
  userPhone: string;
  userName?: string;
  intent: string;
  entities: Record<string, any>;
  rawMessage: string;
}

interface N8nPayload {
  tenantId: string;
  action: string;
  payload: Record<string, any>;
}

@Injectable()
export class WebhooksService {
  private apiKey: string;

  constructor(
    private config: ConfigService,
    private conversations: ConversationsService,
    private transactions: TransactionsService,
    private prisma: PrismaService,
  ) {
    this.apiKey = this.config.get('N8N_API_KEY', '');
  }

  async handleTypebot(data: TypebotPayload) {
    let { tenantId, instanceId, userPhone, userName, intent, entities, instanceName } = data;

    // Se tenantId ou instanceId não foram informados, tenta buscar via instanceName
    if ((!tenantId || !instanceId) && instanceName) {
      const instance = await this.prisma.whatsappInstance.findFirst({
        where: { instanceName, isActive: true },
      });
      if (instance) {
        tenantId = instance.tenantId;
        instanceId = instance.id;
      }
    }

    if (!tenantId) {
      throw new HttpException('Tenant não identificado ou instância inativa', HttpStatus.BAD_REQUEST);
    }

    // Normaliza o número de telefone removendo sufixo do JID
    if (userPhone && userPhone.includes('@')) {
      userPhone = userPhone.split('@')[0];
    }

    const conversation = await this.conversations.findOrCreate(
      tenantId, instanceId, userPhone, userName,
    );

    let response: string;

    switch (intent) {
      case 'create_transaction': {
        const tx = await this.transactions.create(tenantId, undefined, {
          type: entities.type || 'expense',
          amount: Number(entities.amount) || 0,
          description: entities.description || '',
          transactionDate: entities.date || new Date().toISOString(),
          categoryId: entities.categoryId,
          source: 'whatsapp',
        });
        response = `✅ Lançamento registrado: ${tx.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${tx.amount}`;
        break;
      }

      case 'get_balance': {
        const balance = await this.transactions.getBalance(tenantId);
        response = `💰 Saldo: R$ ${balance.balance.toFixed(2)}\n📈 Receitas: R$ ${balance.income.toFixed(2)}\n📉 Despesas: R$ ${balance.expense.toFixed(2)}`;
        break;
      }

      case 'get_summary': {
        const end = entities.endDate || new Date().toISOString();
        const start = entities.startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
        const summary = await this.transactions.getSummary(tenantId, start, end);
        response = `📊 Resumo (${summary.period.startDate.slice(0, 10)} a ${summary.period.endDate.slice(0, 10)}):\n📈 Receitas: R$ ${summary.totalIncome.toFixed(2)}\n📉 Despesas: R$ ${summary.totalExpense.toFixed(2)}\n📦 ${summary.transactionCount} transações`;
        break;
      }

      default:
        response = '❓ Não entendi. Digite "ajuda" para ver os comandos disponíveis.';
    }

    await this.conversations.addMessage(
      conversation.id, tenantId, 'assistant', response,
    );

    return { response, conversationId: conversation.id };
  }

  async handleN8n(data: N8nPayload) {
    if (this.apiKey) {
      return { received: true, action: data.action };
    }
    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  }
}
