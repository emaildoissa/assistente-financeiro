import { Controller, Post, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { Public } from '../../core/auth/public.decorator';
import { WebhooksService } from './webhooks.service';

@Public()
@Controller('webhooks')
export class WebhooksController {
  constructor(private service: WebhooksService) {}

  @Post('typebot')
  handleTypebot(@Body() body: any) {
    return this.service.handleTypebot(body);
  }

  @Post('evolution')
  handleEvolution(@Body() body: any) {
    return this.service.handleEvolution(body);
  }

  @Post('n8n')
  handleN8n(@Body() body: any) {
    return this.service.handleN8n(body);
  }
}
