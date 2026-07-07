import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EvolutionService {
  private baseUrl: string;
  private apiKey: string;

  constructor(private config: ConfigService) {
    this.baseUrl = this.config.get('EVOLUTION_API_URL', 'http://evolution:8080');
    this.apiKey = this.config.get('EVOLUTION_API_KEY', '');
  }

  async sendText(instanceName: string, number: string, text: string, delay = 1000): Promise<void> {
    const url = `${this.baseUrl}/message/sendText/${instanceName}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apiKey': this.apiKey,
      },
      body: JSON.stringify({ number, text, delay }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      console.error(`[EvolutionService] sendText error ${res.status}: ${errorText.slice(0, 300)}`);
      throw new Error(`Evolution API error: ${res.status}`);
    }
  }

  getMediaUrl(instanceName: string, mediaUrl: string): string {
    if (mediaUrl.startsWith('http')) return mediaUrl;
    const base = this.baseUrl.replace(/\/+$/, '');
    return `${base}${mediaUrl.startsWith('/') ? '' : '/'}${mediaUrl}`;
  }

  async downloadMedia(instanceName: string, url: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const fullUrl = this.getMediaUrl(instanceName, url);
    const res = await fetch(fullUrl, {
      headers: { 'apiKey': this.apiKey },
    });
    if (!res.ok) throw new Error(`Media download failed: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const mimeType = res.headers.get('content-type') || 'application/octet-stream';
    return { buffer, mimeType };
  }

  async getBase64FromMediaMessage(instanceName: string, message: any): Promise<string> {
    const url = `${this.baseUrl}/chat/getBase64FromMediaMessage/${instanceName}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apiKey': this.apiKey,
      },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`Evolution API getBase64 error ${res.status}: ${errorText.slice(0, 300)}`);
    }

    const data = await res.json();
    return data.base64;
  }
}
