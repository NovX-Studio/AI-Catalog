# Better Auth — Skill

This project uses **Better Auth** for authentication with **scrypt** hashing (NOT bcrypt).

## Key points

1. **Password hashing**: uses `node:crypto scrypt` internally — do NOT use bcrypt
2. **Creating users in seed**: use `auth.api.signUpEmail()` NOT direct DB insert
3. **Session cookie**: `better-auth.session_token` or `__Secure-better-auth.session_token` (HTTPS)
4. **Middleware**: Edge Runtime cannot import `lib/db` or `lib/auth` — read cookie directly

## Files

### lib/auth.ts (server)
```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});
```

### lib/auth-client.ts (client)
```ts
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
});
export const { signIn, signOut, signUp, useSession } = authClient;
```

### API Route
```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({ headers: await headers() });
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```
