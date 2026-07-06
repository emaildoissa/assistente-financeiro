import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, AiClassification, AudioInput } from '../interfaces/ai-provider.interface';

const DEFAULT_PROMPT = `Você é um assessor financeiro gentil pelo WhatsApp. Retorne SEMPRE APENAS um JSON puro sem formatação markdown.

Intenções disponíveis:
- "create_transaction": Lançar receita ou despesa. Entities: type ("income"/"expense"), amount (number), description (string), categoryId (string, opcional), date (ISO string, opcional)
- "get_balance": Consultar saldo atual
- "get_summary": Resumo de um período. Entities: startDate (ISO string), endDate (ISO string)
- "chat": Bate-papo ou saudação. Entities: reply (string, sua resposta amigável)

Exemplos:
Mensagem: "ola"
Resposta: {"intent": "chat", "entities": {"reply": "Olá! Como posso ajudar você com suas finanças hoje?"}}

Mensagem: "gastei 50 com uber"
Resposta: {"intent": "create_transaction", "entities": {"type": "expense", "amount": 50, "description": "Uber"}}

Mensagem: "meu saldo"
Resposta: {"intent": "get_balance", "entities": {}}

Mensagem: "resumo do mes"
Resposta: {"intent": "get_summary", "entities": {}}`;

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

    if (audio) {
      parts.push({
        inline_data: { mime_type: audio.mimeType, data: audio.base64 },
      });
      parts.push({
        text: `Transcreva o áudio acima e classifique a intenção financeira. Se houver valores numéricos (contas, preços), extraia como entidade "amount" do tipo "expense" com a descrição adequada.\n\n${this.systemPrompt}`,
      });
    } else {
      parts.push({
        text: `${this.systemPrompt}\n\nMensagem: ${message}`,
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
