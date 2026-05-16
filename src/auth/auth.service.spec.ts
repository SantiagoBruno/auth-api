import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

const mockUser = { id: 1, email: 'user@test.com', password: 'hashed' };

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = { sign: jest.fn().mockReturnValue('token') };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('cria usuário quando e-mail ainda não existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'user@test.com',
        password: '123456',
      });

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Usuário criado com sucesso' });
    });

    it('lança ConflictException quando e-mail já está cadastrado', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'user@test.com', password: '123456' }),
      ).rejects.toThrow(ConflictException);

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('retorna access_token com credenciais válidas', async () => {
      const hashed = await bcrypt.hash('123456', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });

      const result = await service.login({
        email: 'user@test.com',
        password: '123456',
      });

      expect(result).toEqual({ access_token: 'token' });
      expect(mockJwt.sign).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email });
    });

    it('lança UnauthorizedException quando usuário não existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nope@test.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lança UnauthorizedException quando senha está errada', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });

      await expect(
        service.login({ email: 'user@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
