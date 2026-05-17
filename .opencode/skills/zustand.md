# Zustand v5 — Skill

This project uses **Zustand v5** for client-side state management.

## Pattern

State is defined in `lib/store.ts` using `create()`:

```ts
import { create } from "zustand";

interface MyStore {
  items: string[];
  setItems: (items: string[]) => void;
}

export const useMyStore = create<MyStore>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
}));
```

## Rules

1. Use `create<T>((set, get) => ({...}))` pattern
2. Use `get()` to access current state inside actions
3. Use `set()` for partial state updates
4. Mark file with `"use client"` at the top
5. Two stores exist in this project:
   - `useCatalogStore` — products, searchQuery, categoryFilter
   - `useChatStore` — messages, isOpen, isLoading
