import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, AiClassification, AudioInput } from './interfaces/ai-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';

@Injectable()
export class AiService implements OnModuleInit {
  private provider: AiProvider;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const providerName = this.config.get('AI_PROVIDER', 'gemini');

    switch (providerName) {
      case 'openai':
        this.provider = new OpenAiProvider(this.config);
        break;
      case 'gemini':
      default:
        this.provider = new GeminiProvider(this.config);
    }
  }

  async classify(message: string, audio?: AudioInput, categoriesContext?: string): Promise<AiClassification> {
    return this.provider.classify(message, audio, categoriesContext);
  }
}
