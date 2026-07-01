import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const slug = req.headers['x-tenant-slug'] as string;

    if (tenantId) {
      const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
      if (tenant && tenant.isActive) {
        (req as any).tenant = { id: tenant.id, slug: tenant.slug };
      }
    } else if (slug) {
      const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
      if (tenant && tenant.isActive) {
        (req as any).tenant = { id: tenant.id, slug: tenant.slug };
      }
    }

    next();
  }
}
