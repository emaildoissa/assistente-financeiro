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
  mediaMimeType?: string;
  base64Media?: string;
  body?: string;
  intent?: string;
  gemini_response?: string;
  entities?: Record<string, any>;
  entities_str?: string;
  rawMessage: string;
}

interface N8nPayload {
  tenantId: string;
  action: string;
  payload: Record<string, any>;
  apiKey?: string;
}

@Injectable()
export class WebhooksService {
  private n8nApiKey: string;
  private defaultTenantId: string;
  private defaultInstanceId: string;

  constructor(
    private config: ConfigService,
    private conversations: ConversationsService,
    private transactions: TransactionsService,
    private prisma: PrismaService,
    private ai: AiService,
    private evolution: EvolutionService,
  ) {
    this.n8nApiKey = this.config.get('N8N_API_KEY', '');
    this.defaultTenantId = this.config.get('DEFAULT_TENANT_ID', '');
    this.defaultInstanceId = this.config.get('DEFAULT_INSTANCE_ID', '');
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

    if (greetings.includes(clean)) return true;

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

    // Normaliza rawMessage: aceita body como fallback
    let rawMessage = data.rawMessage;
    if (!rawMessage || rawMessage === 'unknown') {
      rawMessage = data.body || '';
    }

    // Guard anti-loop: ignora payloads vazios
    if (!rawMessage && !data.audioUrl) {
      console.log('[WebhooksService] Payload vazio ignorado');
      return { received: true, ignored: true };
    }

    // Parse de intent/entities pré-processados
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

    // ── Resolve tenant/instance ──────────────────────────────────────────────
    // 1º: tenta pelo instanceName no banco
    if ((!tenantId || !instanceId) && instanceName) {
      const instance = await this.prisma.whatsappInstance.findFirst({
        where: { instanceName, isActive: true },
      });
      if (instance) {
        tenantId = instance.tenantId;
        instanceId = instance.id;
        console.log(`[WebhooksService] Tenant resolvido pelo instanceName "${instanceName}": ${tenantId}`);
      } else {
        console.warn(`[WebhooksService] WhatsappInstance "${instanceName}" não encontrada no banco.`);
      }
    }

    // 2º fallback: usa DEFAULT_TENANT_ID da env var
    if (!tenantId && this.defaultTenantId) {
      tenantId = this.defaultTenantId;
      instanceId = instanceId || this.defaultInstanceId || undefined;
      console.log(`[WebhooksService] Usando DEFAULT_TENANT_ID como fallback: ${tenantId}`);
    }

    if (!tenantId) {
      console.error(`[WebhooksService] ERRO CRÍTICO: Tenant não identificado!`, {
        instanceName,
        userPhone,
        hint: 'Cadastre a WhatsappInstance no banco OU defina DEFAULT_TENANT_ID na env',
      });
      throw new HttpException(
        'Tenant não identificado. Cadastre a WhatsappInstance ou defina DEFAULT_TENANT_ID na env.',
        HttpStatus.BAD_REQUEST,
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Normaliza telefone
    if (!userPhone && remoteJid) {
      userPhone = remoteJid.split('@')[0];
    } else if (userPhone && userPhone.includes('@')) {
      userPhone = userPhone.split('@')[0];
    }
    if (!userPhone) {
      userPhone = 'unknown';
    }

    const conversation = await this.conversations.findOrCreate(
      tenantId, instanceId, userPhone, userName,
    );

    // Salva mensagem do usuário
    await this.conversations.addMessage(conversation.id, tenantId, 'user', rawMessage || '[áudio]', {
      type: data.audioUrl ? 'audio' : 'text',
    });

    // Step 1: Greeting detection (sem chamar IA)
    console.log(`[WebhooksService] rawMessage="${rawMessage}" phone="${userPhone}" intent="${intent}" isGreeting=${this.isGreetingOnly(rawMessage)}`);
    if (!intent && rawMessage && this.isGreetingOnly(rawMessage)) {
      const greetingResponse = 'Em que posso ajudar?';
      await this.conversations.addMessage(conversation.id, tenantId, 'assistant', greetingResponse);
      return { response: greetingResponse, conversationId: conversation.id };
    }

    // Step 2: Download de áudio ou uso direto do Base64
    let audioInput: { base64: string; mimeType: string } | undefined;
    if (data.base64Media && data.mediaMimeType) {
      audioInput = { 
        base64: data.base64Media, 
        mimeType: data.mediaMimeType.split(';')[0].trim() 
      };
    } else if (data.audioUrl) {
      try {
        audioInput = await this.downloadAudio(data.audioUrl, data.instanceName);
        const fallbackMime = data.mediaMimeType || 'audio/ogg';
        if (!audioInput.mimeType || audioInput.mimeType.includes('octet-stream')) {
          audioInput.mimeType = fallbackMime;
        }
        audioInput.mimeType = audioInput.mimeType.split(';')[0].trim();
      } catch (e) {
        console.error(`[WebhooksService] Audio download failed: ${e instanceof Error ? e.message : e}`);
      }
    }

    // Step 3: Classificação via IA
    if (!intent && (rawMessage || audioInput)) {
      try {
        const categories = await this.prisma.financialCategory.findMany({
          where: { tenantId }
        });
        const categoriesContext = categories.length > 0 
          ? categories.map(c => `ID: ${c.id} - ${c.name} (${c.type})`).join('\n')
          : undefined;

        const result = await this.ai.classify(rawMessage, audioInput, categoriesContext);
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
          dueDate: entities.dueDate,
          status: entities.status || 'paid',
          categoryId: entities.categoryId,
          source: 'whatsapp',
        });
        const tipo = tx.type === 'income' ? '📈 Receita' : '📉 Despesa';
        const valor = Number(tx.amount).toFixed(2).replace('.', ',');
        const fallbackResponse = `✅ Registrado: ${tipo} de R$ ${valor}${tx.description ? ` — ${tx.description}` : ''}`;
        response = entities.bot_reply ? `🤖 ${entities.bot_reply}` : fallbackResponse;
        break;
      }

      case 'get_balance': {
        const balance = await this.transactions.getBalance(tenantId);
        const fallbackResponse = [
          `💰 Saldo: R$ ${balance.balance.toFixed(2).replace('.', ',')}`,
          `📈 Receitas: R$ ${balance.income.toFixed(2).replace('.', ',')}`,
          `📉 Despesas: R$ ${balance.expense.toFixed(2).replace('.', ',')}`,
        ].join('\n');
        response = entities.bot_reply ? `🤖 ${entities.bot_reply}\n\n${fallbackResponse}` : fallbackResponse;
        break;
      }

      case 'get_summary': {
        const end = entities.endDate || new Date().toISOString();
        const start = entities.startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
        const summary = await this.transactions.getSummary(tenantId, start, end);
        const fallbackResponse = [
          `📊 Resumo (${summary.period.startDate.slice(0, 10)} a ${summary.period.endDate.slice(0, 10)}):`,
          `📈 Receitas: R$ ${summary.totalIncome.toFixed(2).replace('.', ',')}`,
          `📉 Despesas: R$ ${summary.totalExpense.toFixed(2).replace('.', ',')}`,
          `📦 ${summary.transactionCount} transações`,
        ].join('\n');
        response = entities.bot_reply ? `🤖 ${entities.bot_reply}\n\n${fallbackResponse}` : fallbackResponse;
        break;
      }

      case 'chat': {
        response = entities.reply || 'Olá! Sou o seu assessor financeiro. Como posso ajudar?';
        break;
      }

      default:
        response = '❓ Não entendi. Tente: "gastei 50 com uber", "meu saldo", ou "resumo do mês".';
    }

    await this.conversations.addMessage(conversation.id, tenantId, 'assistant', response);

    return { response, conversationId: conversation.id };
  }

  async handleEvolution(data: any) {
    const msgData = data?.data || data;
    const remoteJid = msgData?.key?.remoteJid || msgData?.remoteJid || '';
    const userPhone = remoteJid.split('@')[0] || msgData?.userPhone || '';
    
    // Função auxiliar para normalizar número (pega DDD e os últimos 8 dígitos)
    const normalizePhone = (phone: string) => {
      const clean = phone.replace(/\D/g, '');
      if (clean.length < 10) return clean;
      
      // Se for Brasil (começa com 55) e tiver 12 ou 13 dígitos
      if (clean.startsWith('55') && (clean.length === 12 || clean.length === 13)) {
        const ddd = clean.substring(2, 4);
        const last8 = clean.slice(-8);
        return ddd + last8;
      }
      return clean.slice(-10); // fallback para outros países
    };

    const pushName = msgData?.pushName || '';
    const instanceName = data?.instance || data?.instanceName || '';

    // Buscar a instância no banco para descobrir o ownerPhone
    let tenantId: string | undefined;
    let instanceId: string | undefined;
    let ownerPhone: string | undefined;

    if (instanceName) {
      const instance = await this.prisma.whatsappInstance.findFirst({
        where: { instanceName, isActive: true },
      });
      if (instance) {
        tenantId = instance.tenantId;
        instanceId = instance.id;
        ownerPhone = instance.ownerPhone || undefined;
      }
    }

    const userNormalized = normalizePhone(userPhone);

    // 1. TRAVA DE SEGURANÇA: Só responde se o número normalizado for igual ao ownerPhone da instância
    if (ownerPhone) {
      const ownerNormalized = normalizePhone(ownerPhone);
      if (userNormalized !== ownerNormalized) {
        console.log(`[WebhooksService] Mensagem de terceiros ignorada na instância ${instanceName}: ${userPhone}`);
        return { received: true, ignored: true, reason: 'not_owner' };
      }
    } else {
      console.warn(`[WebhooksService] Instância ${instanceName} não tem ownerPhone configurado. Nenhuma trava de segurança aplicada!`);
    }

    let rawMessage = '';
    let audioUrl: string | undefined;
    let mediaMimeType: string | undefined;
    let base64Media: string | undefined;

    if (msgData?.body) {
      rawMessage = msgData.body;
    } else {
      const message = msgData?.message || {};
      const messageType = msgData?.messageType || 'conversation';
      if (messageType === 'conversation' && message.conversation) {
        rawMessage = message.conversation;
      } else if (messageType === 'extendedTextMessage' && message.extendedTextMessage?.text) {
        rawMessage = message.extendedTextMessage.text;
      } else if ((messageType === 'audioMessage' || messageType === 'ptvMessage') && (message.audioMessage?.url || message.ptvMessage?.url)) {
        audioUrl = message.audioMessage?.url || message.ptvMessage?.url;
        mediaMimeType = message.audioMessage?.mimetype || message.ptvMessage?.mimetype || 'audio/ogg';
        if (msgData.base64) base64Media = msgData.base64;
      } else if (messageType === 'imageMessage' && message.imageMessage?.url) {
        rawMessage = message.imageMessage.caption || '';
        audioUrl = message.imageMessage.url;
        mediaMimeType = message.imageMessage?.mimetype || 'image/jpeg';
        if (msgData.base64) base64Media = msgData.base64;
      }

      // Se é mídia mas não veio o base64 direto, solicita a descriptografia para a Evolution API
      if (audioUrl && !base64Media) {
        try {
          base64Media = await this.evolution.getBase64FromMediaMessage(instanceName, msgData);
        } catch (err) {
          console.error(`[WebhooksService] Falha ao descriptografar media: ${err}`);
        }
      }
    }

    // Interceptar cliques em botões
    let buttonId: string | undefined;
    const messageObj = msgData?.message || {};
    if (messageObj?.buttonsResponseMessage?.selectedButtonId) {
      buttonId = messageObj.buttonsResponseMessage.selectedButtonId;
    } else if (messageObj?.templateButtonReplyMessage?.selectedId) {
      buttonId = messageObj.templateButtonReplyMessage.selectedId;
    } else if (messageObj?.interactiveResponseMessage?.nativeFlowResponseMessage?.id) {
      buttonId = messageObj.interactiveResponseMessage.nativeFlowResponseMessage.id;
      try { const p = JSON.parse(buttonId as string); if (p.id) buttonId = p.id; } catch {}
    } else if (messageObj?.listResponseMessage?.singleSelectReply?.selectedRowId) {
      buttonId = messageObj.listResponseMessage.singleSelectReply.selectedRowId;
    }

    if (buttonId && buttonId.startsWith('pay_')) {
      const txId = buttonId.replace('pay_', '');
      try {
        await this.transactions.update(txId, tenantId!, { status: 'paid', paymentDate: new Date().toISOString() });
        await this.evolution.sendText(instanceName, userPhone, '✅ Maravilha! Conta marcada como paga.');
        return { received: true, action: 'mark_paid', txId };
      } catch (e) {
        console.error(`[WebhooksService] Falha ao marcar conta como paga:`, e);
        await this.evolution.sendText(instanceName, userPhone, '❌ Ocorreu um erro ao marcar a conta como paga.');
        return { received: true, error: true };
      }
    }

    if (!rawMessage && !audioUrl) return { received: true, ignored: true };

    // 2. EVITAR LOOP INFINITO: Ignorar mensagens que começam com os padrões do Bot
    const botPrefixes = ['✅', '💰', '📊', '❓', 'Em que posso ajudar?', '🤖'];
    if (rawMessage && botPrefixes.some(p => rawMessage.startsWith(p))) {
      console.log(`[WebhooksService] Mensagem gerada pelo bot ignorada (loop prevention).`);
      return { received: true, ignored: true, reason: 'bot_loop_prevention' };
    }

    const typebotPayload: TypebotPayload = {
      tenantId,
      instanceId,
      userPhone,
      userName: pushName,
      instanceName,
      rawMessage,
      audioUrl,
      mediaMimeType,
      base64Media,
      remoteJid,
    };
    const result = await this.handleTypebot(typebotPayload);

    // Envia resposta via Evolution API
    if (result.response) {
      await this.evolution.sendText(instanceName, userPhone, result.response);
    }
    return result;
  }

  async handleN8n(data: N8nPayload, incomingApiKey?: string) {
    if (this.n8nApiKey && incomingApiKey !== this.n8nApiKey) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (data.action === 'send_daily_reminders') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      // Buscar instâncias ativas que possuem dono (ownerPhone)
      const instances = await this.prisma.whatsappInstance.findMany({
        where: { isActive: true, ownerPhone: { not: null } },
      });

      let sentCount = 0;

      for (const instance of instances) {
        const tenantId = instance.tenantId;
        const ownerPhone = instance.ownerPhone!;
        const instanceName = instance.instanceName;

        // Buscar despesas pendentes com vencimento até hoje
        const pendingBills = await this.prisma.financialTransaction.findMany({
          where: {
            tenantId,
            status: 'pending',
            type: 'expense',
            dueDate: { lte: endOfToday }, // Vence até hoje (inclui atrasadas)
          },
          orderBy: { dueDate: 'asc' },
        });

        let message = '';
        if (pendingBills.length === 0) {
          message = 'Bom dia! ☀️\nVocê não tem contas pendentes com vencimento para hoje! 🎉';
          try {
            await this.evolution.sendText(instanceName, ownerPhone, message);
            sentCount++;
          } catch (e) {
            console.error(`[WebhooksService] Falha ao enviar lembrete sem contas para ${ownerPhone}:`, e);
          }
        } else {
          message = `Bom dia! ☀️\nVocê tem ${pendingBills.length} conta(s) para pagar (vencendo hoje ou atrasadas):`;
          try {
            await this.evolution.sendText(instanceName, ownerPhone, message);
            await new Promise(r => setTimeout(r, 1000));
            
            for (const bill of pendingBills) {
              const dateStr = bill.dueDate ? bill.dueDate.toISOString().slice(0, 10).split('-').reverse().join('/') : 'Sem data';
              const amount = Number(bill.amount).toFixed(2).replace('.', ',');
              const billText = `🔹 *${bill.description || 'Conta'}*\n💰 R$ ${amount}\n📅 Venc: ${dateStr}`;
              
              try {
                await this.evolution.sendButtons(instanceName, ownerPhone, billText, [
                  { id: `pay_${bill.id}`, text: 'Já paguei ✅' }
                ]);
                sentCount++;
                await new Promise(r => setTimeout(r, 1000));
              } catch (btnErr) {
                console.error(`[WebhooksService] sendButtons failed, fallback to text:`, btnErr);
                await this.evolution.sendText(instanceName, ownerPhone, billText + '\n\n*(Responda "paguei <valor>" se já efetuou)*');
              }
            }
          } catch (e) {
            console.error(`[WebhooksService] Falha ao enviar lembrete para ${ownerPhone}:`, e);
          }
        }
      }

      return { received: true, action: data.action, sentCount };
    }

    return { received: true, action: data.action };
  }
}
