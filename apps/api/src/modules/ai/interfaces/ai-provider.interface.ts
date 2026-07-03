export interface AiClassification {
  intent: string;
  entities: Record<string, any>;
}

export interface AiProvider {
  classify(message: string): Promise<AiClassification>;
}
