# Zod — Skill

This project uses **Zod** for schema validation.

## Pattern

Schemas are defined in `lib/validations.ts`:

```ts
import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(2).max(100),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  available: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof ProductSchema>;
```

## Rules

1. Use `z.object({...})` for structured data
2. Export both the schema and the inferred type
3. Use `.safeParse()` for validation — returns `{ success, data, error }`
4. Parse errors via `error.flatten().fieldErrors`
5. All project schemas are in `lib/validations.ts`
