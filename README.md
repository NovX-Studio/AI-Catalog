# AI Catalog

A full-stack product catalog powered by AI. Business owners manage inventory through an admin panel, while customers browse products and chat with an AI assistant powered by Google Gemini.

## Tech Stack

- **Framework**: Next.js 15+ (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Database**: Prisma ORM 7 + SQLite (via better-sqlite3 adapter)
- **Authentication**: Better Auth
- **AI Chat**: Google Gemini API (`gemini-2.0-flash`)
- **Validation**: Zod

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your values:

```env
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET="your-random-secret"   # generate: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key"      # get free key at aistudio.google.com
```

### 3. Run database migration

```bash
npx prisma migrate dev --name init
```

### 4. Seed the database

Creates the admin user and sample products:

```bash
npx prisma db seed
```

### 5. Start the development server

```bash
npm run dev
```

### 6. Open the app

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Public catalog |
| `http://localhost:3000/admin/login` | Admin panel login |

**Default admin credentials:**
- Email: `admin@catalog.com`
- Password: `admin123`

## Features

### Public Catalog
- Responsive product grid (1/2/3 columns)
- Real-time search filtering by product name
- AI-powered chat assistant (bottom-right bubble) — answers questions about products, pricing, and stock in any language
- Contact section: WhatsApp, Instagram, Email

### Admin Panel
- Secure login with session management (Better Auth)
- Product dashboard with image thumbnails and status badges
- Add/Edit/Delete products with Zod form validation and image preview
- Mobile-responsive sidebar (hamburger menu on mobile)

## Customization

### Contact Info
Edit [`lib/contact.ts`](lib/contact.ts) to update your WhatsApp number, Instagram URL, and email address.

### AI Behavior
Edit the system prompt in [`app/api/chat/route.ts`](app/api/chat/route.ts).

### Image Domains
Add allowed image hostnames to [`next.config.ts`](next.config.ts) under `images.remotePatterns`.

## Project Structure

```
app/
  page.tsx                      # Public catalog
  admin/
    login/page.tsx              # Admin login
    dashboard/page.tsx          # Product table
    products/new/page.tsx       # Add product
    products/[id]/edit/page.tsx # Edit product
  api/
    products/route.ts           # GET all, POST new
    products/[id]/route.ts      # GET one, PUT, DELETE
    chat/route.ts               # Gemini AI endpoint
    auth/[...all]/route.ts      # Better Auth handler

components/
  catalog/
    ProductGrid.tsx             # Filtered product grid
    ProductCard.tsx             # Individual product card
    SearchBar.tsx               # Real-time search input
    ChatWidget.tsx              # Floating AI chat bubble
    ContactButtons.tsx          # WhatsApp/Instagram/Email
  admin/
    ProductForm.tsx             # Add/edit form with validation
    ProductTable.tsx            # Product list with actions
    Sidebar.tsx                 # Admin navigation
  ui/                           # shadcn/ui components

lib/
  auth.ts                       # Better Auth server config
  auth-client.ts                # Better Auth client config
  db.ts                         # Prisma client singleton
  gemini.ts                     # Gemini AI client
  store.ts                      # Zustand stores
  validations.ts                # Zod schemas
  contact.ts                    # Contact config

prisma/
  schema.prisma                 # Database schema
  seed.ts                       # Seed: admin user + sample products
prisma.config.ts                # Prisma 7 configuration
middleware.ts                   # Route protection for /admin/*
```
