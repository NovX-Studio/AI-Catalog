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
  createdAt: string;
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

export type SortField = "name" | "price" | "createdAt";
export type SortOrder = "asc" | "desc";

interface CatalogStore {
  products: Product[];
  searchQuery: string;
  categoryFilter: string | null;
  categories: Category[];
  page: number;
  pageSize: number;
  sortField: SortField;
  sortOrder: SortOrder;
  minPrice: number | null;
  maxPrice: number | null;
  compareIds: string[];
  quickViewProduct: Product | null;
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (categoryId: string | null) => void;
  setPage: (page: number) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setMinPrice: (price: number | null) => void;
  setMaxPrice: (price: number | null) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  setQuickViewProduct: (product: Product | null) => void;
  filteredProducts: () => Product[];
  paginatedProducts: () => Product[];
  totalPages: () => number;
  topSellingProducts: () => Product[];
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
  page: 1,
  pageSize: 12,
  sortField: "createdAt",
  sortOrder: "desc",
  minPrice: null,
  maxPrice: null,
  compareIds: [],
  quickViewProduct: null,

  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setCategoryFilter: (categoryId) => set({ categoryFilter: categoryId, page: 1 }),
  setPage: (page) => set({ page }),
  setSortField: (field) => set({ sortField: field, page: 1 }),
  setSortOrder: (order) => set({ sortOrder: order, page: 1 }),
  setMinPrice: (price) => set({ minPrice: price, page: 1 }),
  setMaxPrice: (price) => set({ maxPrice: price, page: 1 }),

  toggleCompare: (id) =>
    set((state) => ({
      compareIds: state.compareIds.includes(id)
        ? state.compareIds.filter((cid) => cid !== id)
        : state.compareIds.length < 4
          ? [...state.compareIds, id]
          : state.compareIds,
    })),
  clearCompare: () => set({ compareIds: [] }),
  setQuickViewProduct: (product) => set({ quickViewProduct: product }),

  filteredProducts: () => {
    const { products, searchQuery, categoryFilter, sortField, sortOrder, minPrice, maxPrice } = get();
    let filtered = products;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((p) => p.categoryId === categoryFilter);
    }

    if (minPrice !== null) {
      filtered = filtered.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== null) {
      filtered = filtered.filter((p) => p.price <= maxPrice);
    }

    filtered.sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      if (sortField === "name") return a.name.localeCompare(b.name) * dir;
      if (sortField === "price") return (a.price - b.price) * dir;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
    });

    return filtered;
  },

  paginatedProducts: () => {
    const filtered = get().filteredProducts();
    const { page, pageSize } = get();
    return filtered.slice(0, page * pageSize);
  },

  totalPages: () => {
    const filtered = get().filteredProducts();
    const { pageSize } = get();
    return Math.ceil(filtered.length / pageSize);
  },

  topSellingProducts: () => {
    return get().products.filter((p) => p.available && p.stock > 0).slice(0, 4);
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
