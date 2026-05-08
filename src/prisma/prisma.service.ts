import 'dotenv/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService implements OnModuleInit {
  private prisma!: PrismaClient;

  async onModuleInit() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    this.prisma = new PrismaClient({ adapter });
    await this.prisma.$connect();
  }

  get user() {
    return this.prisma.user;
  }
}
