<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Catalyx — AI Catalog

## Stack quirks

- **Prisma 7**: NO `url` in `schema.prisma` — put it in `prisma.config.ts`. Use `PrismaBetterSqlite3` adapter. Seed config goes in `prisma.config.ts` under `migrations.seed` (NOT package.json).
- **Better Auth**: uses `node:crypto scrypt` (NOT bcrypt). `bcryptjs` in package.json is unused. Never import `lib/db` or `lib/auth` in Edge Runtime files (`middleware.ts`).
- **shadcn/ui v4 / @base-ui/react**: `Button` has NO `asChild` — use `buttonVariants()` as `className` on `<Link>`. `SheetTrigger`/`DropdownMenuTrigger` render their own `<button>` — do NOT wrap with `<Button>` (nested button = hydration error).
- **Gemini**: model `gemini-2.5-flash`. `systemInstruction` must be `{ role: "system", parts: [{ text: "..." }] }` — plain string fails. API key goes in `.env.local` as `GEMINI_API_KEY`.
- **lib/gemini.ts is UNUSED** — module-level `GoogleGenerativeAI` caches env var at import time. Both `/api/chat` and `/api/admin/chat` create instances inline via `new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)` inside the handler.
- **Tailwind v4**: `@import "tailwindcss"` (no `@tailwind` directives). Read `app/globals.css` before writing new styles.
- **Geist font**: import `{ GeistSans, GeistMono }` from `geist/font`. CSS vars: `--font-geist-sans`, `--font-geist-mono`.
- **lucide-react v1.x**: `Instagram` icon does NOT exist — use inline SVG (see `ContactSection.tsx`).
- **Zustand stores**: `useCatalogStore` (products, filters, sorting, pagination, price range, compare, quickView) and `useChatStore` (messages, sendMessage). Product interface requires `createdAt: string`.
- **Zod v4**: validation schema in `lib/validations.ts`.
- **Prisma `createdAt` is `Date`** — call `.toISOString()` before passing to client components (Zustand store expects `createdAt: string`).
- **Product `specs`** is a JSON string — parse with `JSON.parse()` fallback to `{}`. Pattern used in: `app/api/chat/route.ts`, `app/api/admin/chat/route.ts`, `app/product/[id]/page.tsx`, `app/compare/page.tsx`.

## Commands

```powershell
npm run dev        # dev server (Turbopack)
npm run build      # typecheck + build (single command, no separate lint/typecheck)
npx prisma migrate dev --name <name>
npx prisma db seed                     # admin + 25 products + 40 sales
npx prisma studio                      # DB browser
```

## Design & branding

- **Name**: Catalyx (NOT "AI Catalog")
- **Accent**: emerald-500 (`#10B981`). NO purple, blue, or AI cliché aesthetics.
- **Dark bg**: zinc-900 sidebar/hero sections. NO gradients or glassmorphism by default.
- **Typography**: Geist (Inter is banned). Left-aligned hero sections.
- Charts (`recharts`): emerald palette (`#059669`, `#10B981`, `#34D399`, `#6EE7B7`, `#A7F3D0`).

## Routes

Public API:
- `/api/products` (GET, POST), `/api/products/[id]` (GET, PUT, DELETE)
- `/api/categories` (GET)
- `/api/chat` (POST) — public Gemini chat with catalog context
- `/api/admin/chat` (POST) — admin Gemini chat with full analytics context
- `/api/auth/[...all]` — Better Auth handler
- `/api/upload` (POST auth) — image to `public/uploads/`

Admin pages (protected by `middleware.ts` via cookie check):
- `/admin/login`, `/admin/dashboard`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/sales`, `/admin/statistics`, `/admin/chat`

Public pages:
- `/` — Hero, Featured Products (top 4 in-stock), ProductGrid, ContactSection, ChatWidget, CompareBar
- `/product/[id]` — detail: image, specs, stock bar, related products, "Ask AI" button
- `/compare` — side-by-side comparison of 2-4 selected products

## Architecture

- **Middleware** protects `/admin/*` via `better-auth.session_token` cookie. No `lib/` imports (Edge Runtime).
- **Sales** creation uses `$transaction` to atomically `Sale.create` + `Product.stock: { decrement: quantity }`.
- **Statistics** API accepts optional `?from=YYYY-MM-DD&to=YYYY-MM-DD`.
- **CSV export**: `lib/csv.ts` — client-side Blob download (used in admin Sales and Statistics pages).
- **`db.ts`** uses `PrismaBetterSqlite3` adapter with a global singleton pattern. URL fallback `"file:./dev.db"`.
- **`force-dynamic`** is used on server component pages that fetch data (`app/page.tsx`, `app/admin/dashboard/page.tsx`, `app/product/[id]/page.tsx`).
- **Contact config** lives in `lib/contact.ts` (WhatsApp, Instagram via inline SVG, Email).

## Env & setup

Required `.env.local`:
```
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET=<any long string>
BETTER_AUTH_URL="http://localhost:3000"
GEMINI_API_KEY=<key from https://aistudio.google.com/apikey>
```

Admin seed creds: `admin@catalog.com` / `admin123`. `dev.db` / `*.db-journal` gitignored. `CONTEXT.md` exists but is stale (references deprecated APIs).

## Skills

38 skills in `.opencode/skills/`. Skills installed during a conversation are only available in the **next** conversation. No `opencode.json` config file.
