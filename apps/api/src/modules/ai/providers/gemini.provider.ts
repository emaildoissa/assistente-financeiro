import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, AiClassification, AudioInput } from '../interfaces/ai-provider.interface';

const DEFAULT_PROMPT = `Você é um assessor financeiro sarcástico e divertido pelo WhatsApp. Retorne SEMPRE APENAS um JSON puro sem formatação markdown.

Intenções disponíveis:
- "create_transaction": Lançar receita ou despesa ou agendar uma conta. Entities: type ("income"/"expense"), amount (number), description (string), status ("paid"/"pending"), date (ISO string, opcional), dueDate (ISO string, data de vencimento se for um agendamento), categoryId (string, opcional), bot_reply (string)
- "get_balance": Consultar saldo atual. Entities: bot_reply (string)
- "get_summary": Resumo de um período. Entities: startDate (ISO string), endDate (ISO string), bot_reply (string)
- "chat": Bate-papo ou saudação. Entities: reply (string)

Instrução para bot_reply: Gere uma resposta curta, engajadora e com personalidade (seja irônico com gastos fúteis, comemore receitas, etc). A resposta DEVE confirmar o que foi registrado de forma engraçada.

Exemplos:
Mensagem: "gastei 50 com ifood"
Resposta: {"intent": "create_transaction", "entities": {"type": "expense", "amount": 50, "description": "iFood", "status": "paid", "bot_reply": "Mais 50 reais em lanche? O projeto fitness chorou agora. 🍔💸 Tá registrado!"}}

Mensagem: "tenho que pagar a conta de luz de 150 reais que vence dia 10"
Resposta: {"intent": "create_transaction", "entities": {"type": "expense", "amount": 150, "description": "Conta de Luz", "status": "pending", "dueDate": "2026-07-10T00:00:00.000Z", "bot_reply": "Anotado! Agendei a Conta de Luz para o dia 10. Não vai esquecer, hein? 💡"}}

Mensagem: "recebi 120 de freela"
Resposta: {"intent": "create_transaction", "entities": {"type": "income", "amount": 120, "description": "Freela", "bot_reply": "Booooa! R$ 120 pro cofre! É assim que se constrói um império! 🚀"}}`;

@Injectable()
export class GeminiProvider implements AiProvider {
  private apiKey: string;
  private model: string;
  private systemPrompt: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('AI_API_KEY', '');
    this.model = this.config.get('AI_MODEL', 'gemini-2.5-flash-lite');
    this.systemPrompt = this.config.get('AI_SYSTEM_PROMPT') || DEFAULT_PROMPT;
  }

  async classify(message: string, audio?: AudioInput): Promise<AiClassification> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const parts: any[] = [];

    const currentDate = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date());

    if (audio) {
      parts.push({
        inline_data: { mime_type: audio.mimeType, data: audio.base64 },
      });
      parts.push({
        text: `Data atual: ${currentDate}\n\nAnalise o arquivo anexo (pode ser um áudio de voz ou a foto de um recibo/comprovante). Extraia e classifique a intenção financeira. Se houver valores numéricos (contas, preços, totais), extraia como entidade "amount" do tipo "expense" (ou "income" se for recebimento) com a descrição adequada.\n\n${this.systemPrompt}`,
      });
    } else {
      parts.push({
        text: `Data atual: ${currentDate}\n\n${this.systemPrompt}\n\nMensagem: ${message}`,
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[GeminiProvider] HTTP ${response.status}: ${errorText.slice(0, 500)}`);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const usage = data?.usageMetadata || {};
    const modelUsed = data?.modelVersion || this.model;

    console.log(
      `[GeminiProvider] model=${modelUsed} intent=... prompt=${usage.promptTokenCount || 0} ` +
      `output=${usage.candidatesTokenCount || 0} thoughts=${usage.thoughtsTokenCount || 0} ` +
      `total=${usage.totalTokenCount || 0}`
    );

    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    console.log(`[GeminiProvider] intent=${parsed.intent || 'unknown'} entities=${JSON.stringify(parsed.entities || {})}`);

    return {
      intent: parsed.intent || 'unknown',
      entities: parsed.entities || {},
    };
  }
}
