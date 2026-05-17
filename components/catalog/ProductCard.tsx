"use client";

import Image from "next/image";
import { useChatStore } from "@/lib/store";
import { MessageCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  specs?: string;
  price: number;
  costPrice?: number;
  stock: number;
  imageUrl: string | null;
  available: boolean;
  categoryId?: string;
}

export function ProductCard({ product }: { product: Product }) {
  const { openChat } = useChatStore();
  const isAvailable = product.available && product.stock > 0;

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-zinc-200/60 transition-all duration-300 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 flex flex-col">
      <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50">
            <svg className="h-14 w-14 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-zinc-400 mt-2">No image</span>
          </div>
        )}

        <div className="absolute top-2.5 right-2.5">
          {isAvailable ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/90 text-white backdrop-blur-sm shadow-sm">In Stock</span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/90 text-white backdrop-blur-sm shadow-sm">Out of Stock</span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">{product.brand}</p>
        <h3 className="font-semibold text-zinc-900 text-[1.05rem] leading-snug mb-1.5 line-clamp-1 tracking-tight">
          {product.name}
        </h3>
        <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed flex-1">{product.description}</p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
          <div>
            <span className="text-xl font-bold text-zinc-900 tracking-tight">${product.price.toFixed(2)}</span>
            {isAvailable && product.stock <= 5 && <p className="text-xs text-zinc-500 mt-0.5">Only {product.stock} left</p>}
            {!isAvailable && <p className="text-xs text-red-500 mt-0.5">Unavailable</p>}
          </div>
          <button onClick={openChat} className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 hover:border-emerald-300 transition-all active:scale-95">
            <MessageCircle className="h-3.5 w-3.5" /> Ask AI
          </button>
        </div>
      </div>
    </article>
  );
}
