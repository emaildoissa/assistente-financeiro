import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, AiClassification } from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenAiProvider implements AiProvider {
  private apiKey: string;
  private model: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('AI_API_KEY', '');
    this.model = this.config.get('AI_MODEL', 'gpt-4o-mini');
  }

  async classify(message: string): Promise<AiClassification> {
    const url = 'https://api.openai.com/v1/chat/completions';

    const systemPrompt = `Você é um assessor financeiro gentil pelo WhatsApp. Retorne SEMPRE APENAS um JSON puro sem formatação markdown.

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

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
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
