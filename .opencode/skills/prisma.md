# Prisma 7 — Skill

This project uses **Prisma 7** with **SQLite** via `@prisma/adapter-better-sqlite3`.

## Critical differences from Prisma 5/6

| Feature | Old (v5/v6) | New (v7) |
|---|---|---|
| DB URL location | `schema.prisma` `datasource.url` | `prisma.config.ts` `datasource.url` |
| Adapter | Optional | **Required** for SQLite |
| Adapter class | N/A | `PrismaBetterSqlite3` from `@prisma/adapter-better-sqlite3` |
| Seed config | `package.json` `"prisma.seed"` | `prisma.config.ts` `migrations.seed` |

## Files

### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  // NO url here — goes in prisma.config.ts
}
```

### lib/db.ts
```ts
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

### Commands
```bash
npx prisma migrate dev --name <name>
npx prisma db seed
npx prisma studio
```
