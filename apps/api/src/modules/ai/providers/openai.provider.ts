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
export class OpenAiProvider implements AiProvider {
  private apiKey: string;
  private model: string;
  private systemPrompt: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('AI_API_KEY', '');
    this.model = this.config.get('AI_MODEL', 'gpt-4o-mini');
    this.systemPrompt = this.config.get('AI_SYSTEM_PROMPT') || DEFAULT_PROMPT;
  }

  async classify(message: string, audio?: AudioInput, categoriesContext?: string): Promise<AiClassification> {
    if (audio) {
      throw new Error('OpenAI provider does not support audio classification. Use AI_PROVIDER=gemini for audio support.');
    }

    const url = 'https://api.openai.com/v1/chat/completions';
    const currentDate = new Date().toISOString();

    let contextPrompt = this.systemPrompt;
    if (categoriesContext) {
      contextPrompt += `\n\nO usuário possui as seguintes categorias disponíveis:\n${categoriesContext}\nSe a transação for do tipo income ou expense, analise o contexto e TENTE adivinhar a categoria, retornando APENAS O ID NUMÉRICO exato da categoria no campo 'categoryId'. Se nenhuma se encaixar bem, não envie o categoryId.`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: `Data atual: ${currentDate}\n\n${contextPrompt}` },
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
