<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Catalyx — AI Catalog

## Stack quirks

- **Prisma 7**: NO `url` in `schema.prisma` — put it in `prisma.config.ts`. Use `PrismaBetterSqlite3` adapter. Seed config goes in `prisma.config.ts` under `migrations.seed` (NOT in package.json — though both currently exist; `prisma.config.ts` is the source of truth).
- **Better Auth**: uses `node:crypto scrypt` (NOT bcrypt). `bcryptjs` in package.json is unused. Never import `lib/db` or `lib/auth` in Edge Runtime files (`middleware.ts`).
- **shadcn/ui v4 / @base-ui/react**: `Button` has NO `asChild` prop — use `buttonVariants()` as `className` on `<Link>`. `SheetTrigger` / `DropdownMenuTrigger` render their own `<button>` — do NOT wrap with `<Button>` (nested button = hydration error).
- **Gemini**: model `gemini-2.5-flash`. `systemInstruction` in `@google/generative-ai` v0.24.1 must be `{ role: "system", parts: [{ text: "..." }] }` — plain string will fail.
- **Tailwind v4**: different syntax from v3 — read `app/globals.css` before writing new styles.
- **Geist font**: import `{ GeistSans, GeistMono }` from `geist/font`. CSS vars: `--font-geist-sans`, `--font-geist-mono`.
- **lucide-react v1.x**: `Instagram` icon does NOT exist — use inline SVG (see `ContactSection.tsx`).
- **Zustand stores**: `useCatalogStore` (products, filters, categories) and `useChatStore` (messages, sendMessage).
- **Zod v4**: validation schema in `lib/validations.ts`.

## Commands

```powershell
npm run dev        # dev server (Turbopack)
npm run build      # typecheck + build (no separate lint/typecheck scripts)
npx prisma migrate dev --name <name>   # migrate
npx prisma db seed                     # seed (admin + 25 products + 40 sales)
npx prisma studio                      # DB browser
```

Build order matters: `build` includes typecheck. No `lint` or `typecheck` scripts exist.

## Design & branding

- **Name**: Catalyx (NOT "AI Catalog")
- **Accent**: emerald-500 (`#10B981`). NO purple, blue, or AI cliché aesthetics.
- **Dark bg**: zinc-900 sidebar / hero sections. NO gradients or glassmorphism by default.
- **Typography**: Geist (Inter is banned). Track left-aligned hero sections.
- Charts (`recharts`): emerald palette (`#059669`, `#10B981`, `#34D399`, `#6EE7B7`, `#A7F3D0`).

## Skills

38 skills in `.opencode/skills/`. Skills installed during a conversation are only available in the **next** conversation. Top-level `.opencode/` has no `opencode.json` config file.

## Architecture

- **Public**: `app/page.tsx` — hero (split layout, decorative mockup), ProductGrid, ChatWidget (floating, bottom-right), ContactSection.
- **Admin**: `/admin/login`, `/admin/dashboard`, `/admin/products` (+ new/edit pages), `/admin/sales`, `/admin/statistics`, `/admin/chat`. Dark sidebar (zinc-950), mobile sheet. Protected by `middleware.ts` (cookie check only — no module imports).
- **API**: `/api/products`, `/api/products/[id]`, `/api/categories`, `/api/sales`, `/api/statistics`, `/api/admin/chat`, `/api/chat` (public, Gemini), `/api/auth/[...all]` (Better Auth handler), `/api/upload`.
- **DB**: SQLite (`dev.db`). Reset requires `--force` migrate + re-seed + re-login (old sessions invalidated).

## Env & setup

Required `.env.local`:
```
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET=<any long string>
BETTER_AUTH_URL="http://localhost:3000"
GEMINI_API_KEY="AIzaSyCivLNKgfSUsao9iXCiQvuMqs3q8jwlpdA"
```

Admin seed creds: `admin@catalog.com` / `admin123`. Contact config: `lib/contact.ts`. `dev.db` / `*.db-journal` are gitignored.
