import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    jwtService = moduleFixture.get(JwtService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('cria um usuário com dados válidos', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'senha123' })
        .expect(201)
        .expect({ message: 'Usuário criado com sucesso' });
    });

    it('rejeita email duplicado', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'dup@example.com', password: 'senha123' });

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'dup@example.com', password: 'senha123' })
        .expect(409);
    });

    it('rejeita email inválido', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'nao-e-email', password: 'senha123' })
        .expect(400);
    });

    it('rejeita senha com menos de 6 caracteres', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: '123' })
        .expect(400);
    });

    it('rejeita body vazio', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect(400);
    });

    it('rejeita quando password está ausente', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);
    });

    it('rejeita quando email está ausente', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ password: 'senha123' })
        .expect(400);
    });

    it('aceita senha com exatamente 6 caracteres', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: '123456' })
        .expect(201);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'user@example.com', password: 'senha123' });
    });

    it('retorna access_token com credenciais corretas', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'senha123' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(
            typeof (res.body as { access_token: string }).access_token,
          ).toBe('string');
        });
    });

    it('rejeita senha errada', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('rejeita email não cadastrado', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'ghost@example.com', password: 'senha123' })
        .expect(401);
    });

    it('rejeita body inválido', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nao-e-email' })
        .expect(400);
    });

    it('rejeita quando password está ausente', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com' })
        .expect(400);
    });

    it('rejeita body vazio', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('GET /auth/profile', () => {
    let token: string;

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'profile@example.com', password: 'senha123' });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'profile@example.com', password: 'senha123' });

      token = (res.body as { access_token: string }).access_token;
    });

    it('retorna dados do usuário com token válido', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('email', 'profile@example.com');
        });
    });

    it('rejeita requisição sem token', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('rejeita token inválido', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer token.invalido.aqui')
        .expect(401);
    });

    it('rejeita token expirado', () => {
      const expiredToken = jwtService.sign(
        { sub: 1, email: 'profile@example.com' },
        { expiresIn: '0s' },
      );

      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('rejeita Authorization sem prefixo Bearer', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', token)
        .expect(401);
    });
  });
});
