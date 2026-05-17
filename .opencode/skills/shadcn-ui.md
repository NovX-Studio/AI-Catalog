# shadcn/ui v4 — Skill

This project uses **shadcn/ui v4** with **@base-ui/react** (NOT Radix UI).

## Key quirks

| v3 (Radix) | v4 (@base-ui) |
|---|---|
| `asChild` prop | **NO asChild** — use `buttonVariants()` as className |
| Radix primitives | `@base-ui/react` primitives |
| `npx shadcn-ui@latest add` | `npx shadcn@latest add` |

## Rules

1. **Button** has NO `asChild` prop. To style a `<Link>` as a button:
   ```tsx
   import { buttonVariants } from "@/components/ui/button";
   <Link href="/path" className={buttonVariants()}>Click</Link>
   ```

2. **SheetTrigger / DropdownMenuTrigger** already render their own `<button>` — do NOT wrap them with `<Button>`. Apply styles via `className` directly.

3. Available components (already installed):
   - `button`, `input`, `card`, `dialog`, `alert-dialog`, `table`, `badge`, `sheet`, `dropdown-menu`, `textarea`, `select`, `tabs`, `separator`, `tooltip`

4. Install new components:
   ```bash
   npx shadcn@latest add <component-name>
   ```
