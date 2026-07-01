# Blueprint Técnico — Assessor Financeiro

> Clone adaptado do MeuAssessor (https://meuassessor.com)
> Infraestrutura existente: n8n, PostgreSQL, Traefik, Evolution API, Portainer (Docker na VPS)
> Frontend: Vercel | Backend: VPS

---

## Arquitetura

```
VERCEL                    VPS (Docker)
┌──────┐                  ┌────────────────────────────────────────────┐
│      │  api.dominio.com │                                            │
│ Next │◄────────────────►│  Traefik (443)                            │
│ .js  │                  │   │                                        │
│ app  │                  │   ├── api.dominio.com ───► assessor-api    │
│      │                  │   ├── bot.dominio.com ───► assessor-typebot│
└──────┘                  │   ├── n8n.dominio.com ───► n8n             │
                          │   ├── evo.dominio.com ──── evolution-api   │
                          │   └── portainer.dominio → Portainer        │
                          │                                            │
                          │   assessor-api ◄──► PostgreSQL             │
                          │   assessor-api ◄──► Redis                  │
                          │   assessor-worker ◄── Redis (consome jobs) │
                          │   assessor-typebot ◄── OpenAI API          │
                          │                                            │
                          │   WhatsApp ◄── evolution-api               │
                          │       │                                    │
                          │       └── webhook ──► assessor-typebot     │
                          │                            │               │
                          │                            ▼               │
                          │                     assessor-api           │
                          │                                            │
                          │   n8n (cron) ──► assessor-api (webhook)    │
                          └────────────────────────────────────────────┘
```

## Serviços

| Serviço | Stack | Função |
|---|---|---|
| PostgreSQL | infra | Banco principal |
| Redis | infra | Filas, cache, rate limit |
| Traefik | infra | Proxy reverso + SSL |
| assessor-api | custom | API REST (NestJS) |
| assessor-worker | custom | Job processor (Bull) |
| assessor-typebot | self-hosted | Motor de conversa |
| Evolution API | existente | Gateway WhatsApp |
| n8n | existente | Agendamentos e notificações |
| Portainer | existente | Gerenciamento Docker |
| MinIO | opcional | S3-compatible storage |
| Frontend (Next.js) | Vercel | Dashboard web |

## Roadmap

### Semana 1-2: Fundação
1. ✅ Scaffold NestJS + Prisma + migrations iniciais
2. Auth JWT + multi-tenant middleware
3. Redis + Docker Compose dev
4. Deploy typebot self-hosted
5. Webhook Evolution → typebot

### Semana 3-4: Financeiro via WhatsApp
6. CRUD categorias + transações
7. Pipeline typebot → classificar intenção → criar transação
8. Consulta de saldo por WhatsApp
9. Frontend: login + transações + dashboard
10. Upload comprovante via WhatsApp

### Semana 5-6: Tarefas, projetos, lembretes
11. CRUD tarefas + projetos (API + frontend)
12. Lembretes via WhatsApp (n8n agenda + envia)
13. Worker: resumo mensal
14. Fluxo n8n → API → Evolution (notificações)

### Semana 7-8: Polimento e produção
15. Auditoria e logs
16. Rate limiting, idempotência, segurança
17. CI/CD GitHub + Portainer webhook
18. Testes com 1 cliente real

## Fluxo de Deploy

```
Git push main → GitHub Actions → build Docker → push Docker Hub
  → Portainer webhook → docker pull + stack redeploy
```

## Decisões Arquiteturais

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| NestJS (TS) | Go | Coesão com ecossistema existente |
| Isolamento lógico (tenant_id) | Banco separado | Simplicidade operacional |
| typebot self-hosted | Bot custom | Engine validada |
| Bull + Redis | RabbitMQ/Kafka | Simples, suficiente |
| API como fonte da verdade | n8n como central | Consistência, testabilidade |
| Worker separado | Tudo no n8n | Escala independente |
