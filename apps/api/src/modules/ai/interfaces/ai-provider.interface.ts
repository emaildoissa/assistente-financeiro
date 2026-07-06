export interface AiClassification {
  intent: string;
  entities: Record<string, any>;
}

export interface AudioInput {
  base64: string;
  mimeType: string;
}

export interface AiProvider {
  classify(message: string, audio?: AudioInput): Promise<AiClassification>;
}
