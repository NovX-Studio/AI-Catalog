# AI Catalog — Contexto completo del proyecto

> Archivo generado para continuar el desarrollo con otro modelo de IA.
> Cubre stack, decisiones técnicas, bugs resueltos, archivos clave y tareas pendientes.

---

## Stack y versiones exactas

| Tecnología | Versión | Notas importantes |
|---|---|---|
| Next.js | 16.2.6 | App Router, Turbopack |
| Prisma | 7.x | Breaking changes vs v5/v6 — ver sección abajo |
| @prisma/adapter-better-sqlite3 | latest | Requerido en Prisma 7 para SQLite |
| better-sqlite3 | latest | Driver subyacente |
| Better Auth | 1.x | Auth con scrypt (NO bcrypt) |
| shadcn/ui | v4 | Usa @base-ui/react, NO Radix UI |
| Tailwind CSS | v4 | Sintaxis distinta a v3 |
| Zustand | latest | State management |
| Google Gemini | gemini-2.0-flash | vía @google/generative-ai |
| Zod | latest | Validación |
| lucide-react | 1.x | El icono `Instagram` NO existe — usar SVG inline |

---

## Variables de entorno (.env.local)

```env
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET="cualquier-string-largo"
BETTER_AUTH_URL="http://localhost:3000"
GEMINI_API_KEY="tu-api-key-de-google-ai-studio"
```

---

## Credenciales de admin (seed)

```
Email:    admin@catalog.com
Password: admin123
```

---

## Comandos importantes

```bash
# Desarrollo
npm run dev

# Migrar base de datos
npx prisma migrate dev --name init

# Correr seed (crea usuario admin + 6 productos de ejemplo)
npx prisma db seed

# Build producción
npm run build
```

---

## Quirks críticos de Prisma 7 (rompe con versiones anteriores)

1. **No hay `url` en `schema.prisma`** — la URL va en `prisma.config.ts`
2. **Requiere driver adapter** — no funciona sin `@prisma/adapter-better-sqlite3`
3. **El nombre de la clase es `PrismaBetterSqlite3`** (no `PrismaBetterSQLite` ni otro)
4. **El seed se configura en `prisma.config.ts`** bajo `migrations.seed`, NO en `package.json`

### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  // SIN url aquí — va en prisma.config.ts
}
```

### prisma.config.ts
```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: 'ts-node --compiler-options {"module":"commonjs"} prisma/seed.ts',
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
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

---

## Quirks críticos de Better Auth

- Usa `node:crypto scrypt` para hashear passwords, **NO bcrypt**
- Para crear el usuario admin en seed usar `auth.api.signUpEmail()` (no insertar directo en DB)
- Cookie de sesión: `better-auth.session_token` (o `__Secure-better-auth.session_token` en HTTPS)

### lib/auth.ts
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

---

## Quirks críticos de shadcn v4 / @base-ui/react

1. **`Button` NO tiene prop `asChild`** — usar `buttonVariants()` como className en `<Link>` o `<a>`
2. **`SheetTrigger` y `DropdownMenuTrigger` ya renderizan su propio `<button>`** — NO envolverlos con `<Button>` (causa `<button>` anidado = error de hidratación)
3. **Aplicar estilos a triggers via `className` directamente**, no con `asChild`

---

## Quirks de middleware (Edge Runtime)

El middleware corre en Edge Runtime y no puede usar módulos Node.js nativos.
Por eso **no importar `lib/db.ts` ni `lib/auth.ts` en `middleware.ts`** — solo leer la cookie.

### middleware.ts
```ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionCookie =
      request.cookies.get("better-auth.session_token") ||
      request.cookies.get("__Secure-better-auth.session_token");
    if (!sessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
```

---

## Estructura de archivos

```
Catalogo-IA/
├── app/
│   ├── globals.css              # Tailwind v4, Inter font, animaciones chat
│   ├── layout.tsx               # Inter font via next/font/google
│   ├── page.tsx                 # Catálogo público: navbar, hero, grid, chat, footer
│   ├── api/
│   │   ├── auth/[...all]/route.ts   # Better Auth handler
│   │   ├── chat/route.ts            # POST → Gemini AI → respuesta
│   │   ├── products/
│   │   │   ├── route.ts             # GET (público) / POST (auth)
│   │   │   └── [id]/route.ts        # GET / PUT / DELETE
│   │   └── upload/route.ts          # POST multipart → guarda en public/uploads/
│   └── admin/
│       ├── layout.tsx           # Sidebar oscuro + Sheet mobile
│       ├── login/page.tsx       # Login con signIn.email()
│       ├── dashboard/page.tsx   # Stats cards + ProductTable
│       └── products/
│           ├── new/page.tsx     # ProductForm mode="create"
│           └── [id]/edit/page.tsx  # ProductForm mode="edit"
├── components/
│   ├── catalog/
│   │   ├── NavbarLogo.tsx       # Logo con gradiente
│   │   ├── SearchBar.tsx        # Input rounded-full con X para limpiar
│   │   ├── ProductCard.tsx      # aspect-[4/3], badge stock, botón "Ask AI"
│   │   ├── ProductGrid.tsx      # Grid responsivo 1/2/3 cols
│   │   ├── ChatWidget.tsx       # Widget flotante con IA (bottom-right)
│   │   └── ContactSection.tsx   # 3 cards: WhatsApp, Instagram, Email
│   └── admin/
│       ├── Sidebar.tsx          # Nav dark #0F0A1E, activo #6C47FF
│       ├── ProductTable.tsx     # Tabla con DropdownMenu (Edit/Delete)
│       └── ProductForm.tsx      # Form con toggle Upload/URL para imagen
├── lib/
│   ├── db.ts                    # Singleton Prisma con adapter
│   ├── auth.ts                  # Better Auth config
│   ├── auth-client.ts           # createAuthClient (frontend)
│   ├── gemini.ts                # GoogleGenerativeAI gemini-2.0-flash
│   ├── store.ts                 # Zustand: useCatalogStore + useChatStore
│   ├── validations.ts           # Zod ProductSchema
│   └── contact.ts               # Config WhatsApp/Instagram/Email (editar aquí)
├── prisma/
│   ├── schema.prisma            # Modelos: Product, User, Session, Account, Verification
│   └── seed.ts                  # Crea admin + 6 productos de ejemplo
├── prisma.config.ts             # Config Prisma 7 (URL + seed command)
└── middleware.ts                # Protege /admin/* con cookie check
```

---

## Paleta de colores / Design tokens

| Token | Valor | Uso |
|---|---|---|
| `#6C47FF` | Brand purple | Botones primarios, activos, acentos |
| `#5B3AE8` | Brand dark | Hover de botones |
| `#F5F2FF` | Brand light | Fondos de iconos, badges |
| `#0F0A1E` | Dark navy | Fondo sidebar admin |
| `#FAFAFA` | Off-white | Fondo general de páginas |
| `#111827` | Near-black | Texto principal |
| `#6B7280` | Gray | Texto secundario |

---

## Chat con IA — cómo funciona

El widget `ChatWidget.tsx` flota en la esquina inferior derecha del catálogo público (`/`).

1. El usuario escribe un mensaje
2. Zustand `useChatStore.sendMessage()` hace POST a `/api/chat`
3. El API route carga todos los productos de la DB, arma un system prompt con JSON del catálogo
4. Envía al modelo `gemini-2.0-flash` con el historial de conversación
5. Devuelve `{ reply: string }`

**El system prompt actual** solo da contexto de productos (nombre, precio, stock, descripción). No incluye estadísticas agregadas.

**Tarea pendiente importante:** Ampliar el system prompt en `app/api/chat/route.ts` para incluir estadísticas calculadas (total de productos, en stock, sin stock, valor total del catálogo) así el chat puede responder sobre eso.

### app/api/chat/route.ts actual:
```ts
const systemInstruction = `You are a helpful sales assistant for this store. Here is the current product catalog:

${productContext}

Answer customer questions based only on this catalog. Be friendly and helpful. If a product is out of stock, let the customer know. Always respond in the same language the customer uses.`;
```

### Mejora sugerida para el system prompt:
```ts
const totalProducts = products.length;
const inStock = products.filter(p => p.stock > 0 && p.available).length;
const outOfStock = products.filter(p => p.stock === 0 || !p.available).length;
const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

const systemInstruction = `You are a helpful assistant for this store. You can answer questions about products AND catalog statistics.

CATALOG STATISTICS:
- Total products: ${totalProducts}
- In stock: ${inStock}
- Out of stock: ${outOfStock}
- Total catalog value: $${totalValue.toFixed(2)}

PRODUCT CATALOG:
${productContext}

Answer questions about individual products, prices, availability, and catalog statistics. Be friendly and concise. Always respond in the same language the customer uses.`;
```

---

## Estado actual del chat widget

El widget de chat **solo existe en la página pública** (`app/page.tsx`). Si querés un chat en el panel admin, hay que agregarlo manualmente en `app/admin/layout.tsx`.

**El botón del chat es un círculo flotante en el bottom-right** que aparece con animación de pulso la primera vez. Si no se ve, verificar:
1. Que `<ChatWidget />` esté al final de `app/page.tsx` ✅ (ya está)
2. Que `GEMINI_API_KEY` esté en `.env.local`
3. Que el dev server esté corriendo (`npm run dev`)

---

## lib/contact.ts — editar para personalizar

```ts
export const contactConfig = {
  whatsapp: {
    number: "5491112345678",       // ← cambiar por número real
    message: "Hi! I'm interested in a product from your catalog",
  },
  instagram: {
    url: "https://instagram.com/your_store",  // ← cambiar
  },
  email: {
    address: "contact@yourstore.com",         // ← cambiar
    subject: "Product inquiry",
  },
};
```

---

## Modelos Prisma (schema.prisma)

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Float
  stock       Int      @default(0)
  imageUrl    String?
  available   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## API Routes resumen

| Ruta | Método | Auth | Descripción |
|---|---|---|---|
| `/api/auth/[...all]` | * | - | Better Auth handler |
| `/api/products` | GET | No | Lista todos los productos |
| `/api/products` | POST | Sí | Crea producto |
| `/api/products/[id]` | GET | No | Un producto |
| `/api/products/[id]` | PUT | Sí | Actualiza producto |
| `/api/products/[id]` | DELETE | Sí | Elimina producto |
| `/api/chat` | POST | No | Chat con Gemini |
| `/api/upload` | POST | Sí | Sube imagen a `public/uploads/` |

---

## Tareas pendientes / próximos pasos sugeridos

1. **Mejorar el system prompt del chat** (ver sección "Mejora sugerida" arriba) para que responda sobre estadísticas del catálogo

2. **Agregar chat al panel admin** — copiar `<ChatWidget />` en `app/admin/layout.tsx` si se quiere disponible también ahí

3. **Personalizar `lib/contact.ts`** con datos reales de WhatsApp, Instagram y email

4. **Pagination en el catálogo** — si hay muchos productos, agregar paginación o infinite scroll en `ProductGrid.tsx`

5. **Filtros por categoría/precio** — agregar filtros en la barra lateral o encima del grid

6. **Categorías** — agregar campo `category` al modelo `Product` en `schema.prisma` + migrar

7. **Deploy** — el proyecto usa SQLite (archivo `dev.db`). Para producción considerar migrar a PostgreSQL (Supabase, Neon, etc.) o usar SQLite con Turso/LiteFS

8. **Imágenes externas** — en `next.config.ts` hay un `remotePatterns` con wildcard HTTPS. Para producción, limitar a dominios específicos

---

## Animaciones CSS (globals.css)

```css
/* Pulso del botón del chat — se ejecuta 3 veces al cargar */
@keyframes pulse-chat {
  0%   { box-shadow: 0 0 0 0 rgba(108, 71, 255, 0.5); }
  70%  { box-shadow: 0 0 0 14px rgba(108, 71, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(108, 71, 255, 0); }
}
.animate-pulse-chat { animation: pulse-chat 2s ease-in-out 3; }

/* Puntos del "typing indicator" en el chat */
@keyframes bounce-dot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30%            { transform: translateY(-5px); opacity: 1; }
}
.animate-bounce-dot { animation: bounce-dot 1.2s ease-in-out infinite; }
```

---

## Notas finales

- El `build` de producción pasa limpio (`npm run build` sin errores TypeScript)
- La advertencia `"middleware" file convention is deprecated, use "proxy" instead` es de Next.js 16 — no afecta el funcionamiento, es solo un aviso
- `lucide-react` v1.x no tiene icono `Instagram` — se usa un SVG inline en `ContactSection.tsx`
- shadcn v4 con `@base-ui/react` — los componentes UI tienen una API ligeramente diferente. Leer `components/ui/*.tsx` antes de modificarlos
