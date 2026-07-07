import { Controller, Post, Get, Body, HttpCode, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../core/auth/public.decorator';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../../prisma/prisma.service';

@Public()
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private service: WebhooksService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Health check — GET /api/v1/webhooks/health
   */
  @Get('health')
  async health() {
    const defaultTenantId = this.config.get('DEFAULT_TENANT_ID', '');
    const aiProvider = this.config.get('AI_PROVIDER', 'gemini');
    const aiKeyPresente = !!this.config.get('AI_API_KEY', '');
    const evolutionUrl = this.config.get('EVOLUTION_API_URL', '');

    let tenantCount = 0;
    let instanceCount = 0;
    let defaultTenantExists = false;

    try {
      tenantCount = await this.prisma.tenant.count();
      instanceCount = await this.prisma.whatsappInstance.count({ where: { isActive: true } });
      if (defaultTenantId) {
        const t = await this.prisma.tenant.findUnique({ where: { id: defaultTenantId } });
        defaultTenantExists = !!t;
      }
    } catch (e) {
      return {
        ok: false,
        error: 'Erro ao conectar no banco: ' + (e instanceof Error ? e.message : String(e)),
      };
    }

    const instances = await this.prisma.whatsappInstance.findMany({
      select: { instanceName: true, tenantId: true, isActive: true },
    });

    const problems: string[] = [];
    if (tenantCount === 0) problems.push('Nenhum Tenant cadastrado no banco');
    if (instanceCount === 0) problems.push('Nenhuma WhatsappInstance ativa no banco');
    if (!defaultTenantId) problems.push('DEFAULT_TENANT_ID não definida na env');
    if (defaultTenantId && !defaultTenantExists) problems.push(`DEFAULT_TENANT_ID "${defaultTenantId}" não encontrada no banco`);
    if (!aiKeyPresente) problems.push('AI_API_KEY não configurada');

    return {
      ok: problems.length === 0,
      problems,
      config: { aiProvider, aiKeyPresente, evolutionUrl, defaultTenantId: defaultTenantId || '(não definida)', defaultTenantExists },
      banco: { tenants: tenantCount, instancesAtivas: instanceCount, instances },
    };
  }

  /** POST /api/v1/webhooks/typebot */
  @Post('typebot')
  @HttpCode(200)
  async handleTypebot(@Body() body: any, @Res() res: Response) {
    const result = await this.service.handleTypebot(body);
    return res.json(result);
  }

  /** POST /api/v1/webhooks/evolution */
  @Post('evolution')
  @HttpCode(200)
  async handleEvolution(@Body() body: any, @Res() res: Response) {
    const result = await this.service.handleEvolution(body);
    return res.json(result);
  }

  /** POST /api/v1/webhooks/n8n */
  @Post('n8n')
  @HttpCode(200)
  async handleN8n(@Body() body: any, @Res() res: Response) {
    const result = await this.service.handleN8n(body, body?.apiKey);
    return res.json(result);
  }
}
