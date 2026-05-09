import 'dotenv/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService implements OnModuleInit {
  private prisma!: PrismaClient;

  async onModuleInit() {
    const url = process.env.DATABASE_URL ?? '';
    const schemaMatch = url.match(/[?&]schema=([^&]+)/);
    const schema = schemaMatch?.[1];

    const adapter = new PrismaPg(
      { connectionString: url },
      schema ? { schema } : undefined,
    );
    this.prisma = new PrismaClient({ adapter });
    await this.prisma.$connect();
  }

  get user() {
    return this.prisma.user;
  }
}
