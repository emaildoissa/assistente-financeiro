import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConversationsService } from '../conversations/conversations.service';
import { TransactionsService } from '../financial/transactions/transactions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EvolutionService } from './evolution.service';

interface TypebotPayload {
  tenantId?: string;
  instanceId?: string;
  instanceName?: string;
  userPhone: string;
  userName?: string;
  remoteJid?: string;
  audioUrl?: string;
  body?: string;
  intent?: string;
  gemini_response?: string;
  entities?: Record<string, any>;
  entities_str?: string;
  rawMessage: string;
}

interface EvolutionPayload {
  event?: string;
  instance?: string;
  data?: {
    key?: { remoteJid?: string; fromMe?: boolean; id?: string };
    pushName?: string;
    message?: Record<string, any>;
    messageType?: string;
  };
}

interface N8nPayload {
  tenantId: string;
  action: string;
  payload: Record<string, any>;
}

@Injectable()
export class WebhooksService {
  private n8nApiKey: string;

  constructor(
    private config: ConfigService,
    private conversations: ConversationsService,
    private transactions: TransactionsService,
    private prisma: PrismaService,
    private ai: AiService,
    private evolution: EvolutionService,
  ) {
    this.n8nApiKey = this.config.get('N8N_API_KEY', '');
  }

  private isGreetingOnly(msg: string): boolean {
    const clean = msg.trim().toLowerCase();
    if (!clean) return false;

    const greetings = [
      'ola', 'olá', 'oi', 'oie', 'opa', 'salve', 'fala', 'beleza', 'blz',
      'bom dia', 'boa tarde', 'boa noite',
      'e aí', 'e ai', 'tudo bem', 'tudo bom',
    ];

    const botNames = ['assessor', 'bot', 'assistente', 'assistente financeiro'];

    // Ex: "ola", "oi", "bom dia", "e aí"
    if (greetings.includes(clean)) return true;

    // Ex: "ola assessor", "bom dia bot", "oi assistente financeiro"
    const words = clean.split(/\s+/);
    if (greetings.includes(words[0])) {
      const rest = words.slice(1).join(' ');
      if (!rest || rest.split(/\s+/).every(w => botNames.includes(w))) return true;
    }

    return false;
  }

  private async downloadAudio(url: string, instanceName?: string): Promise<{ base64: string; mimeType: string }> {
    let buffer: Buffer;
    let mimeType: string;

    if (instanceName) {
      const media = await this.evolution.downloadMedia(instanceName, url);
      buffer = media.buffer;
      mimeType = media.mimeType;
    } else {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Audio download failed: ${res.status}`);
      buffer = Buffer.from(await res.arrayBuffer());
      mimeType = res.headers.get('content-type') || 'audio/ogg';
    }

    return { base64: buffer.toString('base64'), mimeType };
  }

  async handleTypebot(data: TypebotPayload) {
    let { tenantId, instanceId, userPhone, userName, intent, instanceName, remoteJid } = data;
    let entities = data.entities || {};

    // Normaliza rawMessage: aceita body como fallback se rawMessage vier vazio/unknown
    let rawMessage = data.rawMessage;
    if (!rawMessage || rawMessage === 'unknown') {
      rawMessage = data.body || '';
    }

    if (data.gemini_response) {
      try {
        const str = data.gemini_response.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(str);
        intent = parsed.intent || 'unknown';
        entities = parsed.entities || {};
      } catch {
        intent = 'unknown';
      }
    } else if (data.entities_str) {
      try {
        entities = JSON.parse(data.entities_str);
      } catch {}
    }

    // Resolve tenant/instance
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

    // Normaliza telefone
    if (!userPhone && remoteJid) {
      userPhone = remoteJid.split('@')[0];
    } else if (userPhone && userPhone.includes('@')) {
      userPhone = userPhone.split('@')[0];
    }

    const conversation = await this.conversations.findOrCreate(
      tenantId, instanceId, userPhone, userName,
    );

    // Step 1: Greeting detection (antes de chamar IA)
    console.log(`[WebhooksService] rawMessage="${rawMessage}" phone="${userPhone}" intent="${intent}" isGreeting=${this.isGreetingOnly(rawMessage)}`);
    if (!intent && rawMessage && this.isGreetingOnly(rawMessage)) {
      const greetingResponse = 'Em que posso ajudar?';
      await this.conversations.addMessage(conversation.id, tenantId, 'assistant', greetingResponse);
      return { response: greetingResponse, conversationId: conversation.id };
    }

    // Step 2: Audio support
    let audioInput: { base64: string; mimeType: string } | undefined;
    if (data.audioUrl) {
      try {
        audioInput = await this.downloadAudio(data.audioUrl);
      } catch (e) {
        console.error(`[WebhooksService] Audio download failed: ${e instanceof Error ? e.message : e}`);
      }
    }

    // Step 3: AI classification (se não veio intent do Typebot)
    if (!intent && rawMessage) {
      try {
        const result = await this.ai.classify(rawMessage, audioInput);
        intent = result.intent;
        entities = result.entities;
      } catch (e) {
        console.error(`[WebhooksService] AI classification error: ${e instanceof Error ? e.message : e}`);
        intent = 'unknown';
      }
    }

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

      case 'chat': {
        response = entities.reply || 'Olá! Sou o seu assessor financeiro.';
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

  async handleEvolution(data: EvolutionPayload) {
    const msgData = data?.data;
    if (!msgData || msgData.key?.fromMe) {
      return { received: true, ignored: true };
    }

    const remoteJid = msgData.key?.remoteJid || '';
    const pushName = msgData.pushName || '';
    const instanceName = data.instance || '';
    const userPhone = remoteJid.split('@')[0];
    const message = msgData.message || {};
    const messageType = msgData.messageType || 'conversation';

    // Extrai texto, áudio ou imagem
    let rawMessage = '';
    let audioUrl: string | undefined;

    if (messageType === 'conversation' && message.conversation) {
      rawMessage = message.conversation;
    } else if (messageType === 'extendedTextMessage' && message.extendedTextMessage?.text) {
      rawMessage = message.extendedTextMessage.text;
    } else if (messageType === 'audioMessage' && message.audioMessage?.url) {
      audioUrl = message.audioMessage.url;
    } else if (messageType === 'ptvMessage' && message.ptvMessage?.url) {
      audioUrl = message.ptvMessage.url;
    } else if (messageType === 'imageMessage' && message.imageMessage?.url) {
      rawMessage = message.imageMessage.caption || '';
      audioUrl = message.imageMessage.url;
      // Para imagem, o Gemini pode extrair texto (OCR) — tratamos como áudio para enviar ao provider
    }

    // Resolve tenant/instance
    const instance = await this.prisma.whatsappInstance.findFirst({
      where: { instanceName, isActive: true },
    });
    if (!instance) {
      console.error(`[WebhooksService] Instância não encontrada: ${instanceName}`);
      return { received: true, error: 'instance_not_found' };
    }

    const tenantId = instance.tenantId;
    const instanceId = instance.id;

    const conversation = await this.conversations.findOrCreate(
      tenantId, instanceId, userPhone, pushName,
    );

    // Log da mensagem do usuário
    await this.conversations.addMessage(conversation.id, tenantId, 'user', rawMessage || '[áudio]', {
      type: audioUrl ? 'audio' : messageType,
    });

    // Greeting detection
    if (rawMessage && this.isGreetingOnly(rawMessage)) {
      const greetingResponse = 'Em que posso ajudar?';
      await this.conversations.addMessage(conversation.id, tenantId, 'assistant', greetingResponse);
      await this.evolution.sendText(instanceName, userPhone, greetingResponse);
      return { response: greetingResponse, conversationId: conversation.id };
    }

    // Audio download
    let audioInput: { base64: string; mimeType: string } | undefined;
    if (audioUrl) {
      try {
        audioInput = await this.downloadAudio(audioUrl, instanceName);
        if (!rawMessage) rawMessage = '[áudio]';
      } catch (e) {
        console.error(`[WebhooksService] Audio download failed: ${e instanceof Error ? e.message : e}`);
      }
    }

    // AI classification
    let intent = '';
    let entities: Record<string, any> = {};
    if (rawMessage) {
      try {
        const result = await this.ai.classify(rawMessage, audioInput);
        intent = result.intent;
        entities = result.entities;
      } catch (e) {
        console.error(`[WebhooksService] AI error: ${e instanceof Error ? e.message : e}`);
        intent = 'unknown';
      }
    }

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

      case 'chat': {
        response = entities.reply || 'Olá! Sou o seu assessor financeiro.';
        break;
      }

      default:
        response = '❓ Não entendi. Digite "ajuda" para ver os comandos disponíveis.';
    }

    // Salva resposta e envia no WhatsApp
    await this.conversations.addMessage(conversation.id, tenantId, 'assistant', response);
    await this.evolution.sendText(instanceName, userPhone, response);

    return { response, conversationId: conversation.id };
  }

  async handleN8n(data: N8nPayload) {
    if (this.n8nApiKey) {
      return { received: true, action: data.action };
    }
    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  }
}
