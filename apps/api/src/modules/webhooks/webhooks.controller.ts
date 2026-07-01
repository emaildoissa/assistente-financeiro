import { Controller, Post, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { Public } from '../../core/auth/public.decorator';
import { WebhooksService } from './webhooks.service';

@Public()
@Controller('webhooks')
export class WebhooksController {
  constructor(private service: WebhooksService) {}

  @Post('typebot')
  handleTypebot(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.service.handleTypebot(body);
  }

  @Post('n8n')
  handleN8n(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.service.handleN8n(body);
  }
}
