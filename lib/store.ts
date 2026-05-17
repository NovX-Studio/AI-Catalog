"use client";

import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  specs: string;
  price: number;
  costPrice: number;
  stock: number;
  imageUrl: string | null;
  available: boolean;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

interface CatalogStore {
  products: Product[];
  searchQuery: string;
  categoryFilter: string | null;
  categories: Category[];
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (categoryId: string | null) => void;
  filteredProducts: () => Product[];
}

interface ChatStore {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  toggleChat: () => void;
  openChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  products: [],
  searchQuery: "",
  categoryFilter: null,
  categories: [],
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryFilter: (categoryId) => set({ categoryFilter: categoryId }),
  filteredProducts: () => {
    const { products, searchQuery, categoryFilter } = get();
    let filtered = products;
    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter((p) => p.categoryId === categoryFilter);
    }
    return filtered;
  },
}));

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isOpen: false,
  isLoading: false,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  clearMessages: () => set({ messages: [] }),

  sendMessage: async (text: string) => {
    const history = get().messages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    set((state) => ({
      messages: [
        ...state.messages,
        { role: "user", text, timestamp: new Date() },
      ],
      isLoading: true,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();

      set((state) => ({
        messages: [
          ...state.messages,
          { role: "model", text: data.reply, timestamp: new Date() },
        ],
        isLoading: false,
      }));
    } catch {
      set((state) => ({
        messages: [
          ...state.messages,
          {
            role: "model",
            text: "Sorry, I couldn't process that. Please try again.",
            timestamp: new Date(),
          },
        ],
        isLoading: false,
      }));
    }
  },
}));
