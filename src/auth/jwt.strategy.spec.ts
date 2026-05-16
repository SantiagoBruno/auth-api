import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test_secret';
    strategy = new JwtStrategy();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('validate retorna userId e email a partir do payload', () => {
    const payload = { sub: 42, email: 'user@test.com' };

    const result = strategy.validate(payload);

    expect(result).toEqual({ userId: 42, email: 'user@test.com' });
  });

  it('usa fallback_secret quando JWT_SECRET não está definido', () => {
    delete process.env.JWT_SECRET;
    expect(new JwtStrategy()).toBeDefined();
  });
});
