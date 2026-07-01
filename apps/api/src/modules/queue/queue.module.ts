import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { SummaryProcessor } from './processors/summary.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: Number(config.get('REDIS_PORT', 6379)),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'summary' },
      { name: 'reminders' },
    ),
  ],
  providers: [SummaryProcessor],
  exports: [BullModule],
})
export class QueueModule {}
