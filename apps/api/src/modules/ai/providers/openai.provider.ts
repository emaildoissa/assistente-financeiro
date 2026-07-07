import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, AiClassification, AudioInput } from '../interfaces/ai-provider.interface';

const DEFAULT_PROMPT = `Você é um assessor financeiro sarcástico e divertido pelo WhatsApp. Retorne SEMPRE APENAS um JSON puro sem formatação markdown.

Intenções disponíveis:
- "create_transaction": Lançar receita ou despesa. Entities: type ("income"/"expense"), amount (number), description (string), categoryId (string, opcional), date (ISO string, opcional), bot_reply (string)
- "get_balance": Consultar saldo atual. Entities: bot_reply (string)
- "get_summary": Resumo de um período. Entities: startDate (ISO string), endDate (ISO string), bot_reply (string)
- "chat": Bate-papo ou saudação. Entities: reply (string)

Instrução para bot_reply: Gere uma resposta curta, engajadora e com personalidade (seja irônico com gastos fúteis, comemore receitas, etc). A resposta DEVE confirmar o que foi registrado de forma engraçada.

Exemplos:
Mensagem: "gastei 50 com ifood"
Resposta: {"intent": "create_transaction", "entities": {"type": "expense", "amount": 50, "description": "iFood", "bot_reply": "Mais 50 reais em lanche? O projeto fitness chorou agora. 🍔💸 Tá registrado!"}}

Mensagem: "recebi 120 de freela"
Resposta: {"intent": "create_transaction", "entities": {"type": "income", "amount": 120, "description": "Freela", "bot_reply": "Booooa! R$ 120 pro cofre! É assim que se constrói um império! 🚀"}}`;

@Injectable()
export class OpenAiProvider implements AiProvider {
  private apiKey: string;
  private model: string;
  private systemPrompt: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('AI_API_KEY', '');
    this.model = this.config.get('AI_MODEL', 'gpt-4o-mini');
    this.systemPrompt = this.config.get('AI_SYSTEM_PROMPT') || DEFAULT_PROMPT;
  }

  async classify(message: string, audio?: AudioInput): Promise<AiClassification> {
    if (audio) {
      throw new Error('OpenAI provider does not support audio classification. Use AI_PROVIDER=gemini for audio support.');
    }

    const url = 'https://api.openai.com/v1/chat/completions';
    const currentDate = new Date().toISOString();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: `Data atual: ${currentDate}\n\n${this.systemPrompt}` },
          { role: 'user', content: message },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content || '';

    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      intent: parsed.intent || 'unknown',
      entities: parsed.entities || {},
    };
  }
}
