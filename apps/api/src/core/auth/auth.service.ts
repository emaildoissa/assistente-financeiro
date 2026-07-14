import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('Email already registered');

    const slug = dto.tenantName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        memberships: {
          create: {
            role: 'owner',
            tenant: {
              create: {
                name: dto.tenantName,
                slug,
              },
            },
          },
        },
      },
      include: {
        memberships: {
          include: { tenant: true },
        },
      },
    });

    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      tenantId: user.memberships[0].tenantId,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenant: user.memberships[0].tenant,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        memberships: {
          include: { tenant: true },
        },
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      tenantId: user.memberships[0]?.tenantId,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenant: user.memberships[0]?.tenant,
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: { tenant: true },
        },
      },
    });

    if (!user) return null;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenant: user.memberships[0]?.tenant,
      },
    };
  }
}
