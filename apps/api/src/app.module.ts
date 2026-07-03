import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './core/auth/auth.module';
import { TenantModule } from './core/tenant/tenant.module';
import { UsersModule } from './modules/users/users.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { FinancialModule } from './modules/financial/financial.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { FilesModule } from './modules/files/files.module';
import { QueueModule } from './modules/queue/queue.module';
import { AiModule } from './modules/ai/ai.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    TenantModule,
    UsersModule,
    MembershipsModule,
    FinancialModule,
    DashboardModule,
    WebhooksModule,
    ConversationsModule,
    TasksModule,
    ProjectsModule,
    RemindersModule,
    FilesModule,
    QueueModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
