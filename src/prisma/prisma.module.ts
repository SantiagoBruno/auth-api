import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // torna o PrismaService disponível em toda a aplicação
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}