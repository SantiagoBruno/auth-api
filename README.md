# auth-api

A study project to explore how **NestJS** and **Prisma ORM** work, using an authentication API as a practical use case.

## Goal

Understand in practice how NestJS organizes modules, guards, strategies, and dependency injection, and how Prisma integrates with a PostgreSQL database using the v7 architecture (`pg` adapter).

## Technologies

- **NestJS 11** — Node.js framework with modular architecture
- **Prisma 7** — ORM with `pg` adapter for PostgreSQL
- **Passport + JWT** — authentication via `passport-jwt`
- **bcrypt** — password hashing
- **class-validator** — DTO validation with global `ValidationPipe`

## Implemented features

- User registration (`POST /auth/register`)
- Login with JWT token response (`POST /auth/login`)
- Route protected by `JwtAuthGuard`
- Prisma module isolated as an injectable service

## Structure

```
src/
├── auth/
│   ├── dto/           # RegisterDto, LoginDto
│   ├── jwt.strategy.ts
│   ├── jwt-auth.guard.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
└── main.ts
```

## Setup

**Prerequisites:** Node.js, PostgreSQL running.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file at the root with the database URL:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/auth_db"
   JWT_SECRET="your_secret"
   ```

3. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start the server:
   ```bash
   # development mode (hot reload)
   npm run start:dev

   # production mode
   npm run start:prod
   ```

## Tests

```bash
# unit tests
npm run test

# coverage
npm run test:cov

# e2e
npm run test:e2e
```
