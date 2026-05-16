import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register delega para AuthService.register', async () => {
    const dto = { email: 'a@b.com', password: '123456' };
    mockAuthService.register.mockResolvedValue({ message: 'Usuário criado com sucesso' });

    const result = await controller.register(dto);

    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ message: 'Usuário criado com sucesso' });
  });

  it('login delega para AuthService.login', async () => {
    const dto = { email: 'a@b.com', password: '123456' };
    mockAuthService.login.mockResolvedValue({ access_token: 'token' });

    const result = await controller.login(dto);

    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ access_token: 'token' });
  });

  it('getProfile retorna o usuário do request', () => {
    const req = { user: { userId: 1, email: 'a@b.com' } };

    const result = controller.getProfile(req as any);

    expect(result).toEqual(req.user);
  });
});
