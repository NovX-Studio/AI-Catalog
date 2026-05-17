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
    <article className="group bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col">
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <svg className="h-14 w-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-400 mt-2">No image</span>
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

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-medium text-[#6C47FF] uppercase tracking-wide mb-1">{product.brand}</p>
        <h3 className="font-semibold text-[#111827] text-[1.05rem] leading-snug mb-1 line-clamp-1" style={{ letterSpacing: "-0.01em" }}>
          {product.name}
        </h3>
        <p className="text-[0.9rem] text-[#6B7280] line-clamp-2 leading-relaxed flex-1">{product.description}</p>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-2xl font-bold text-[#6C47FF]" style={{ letterSpacing: "-0.02em" }}>${product.price.toFixed(2)}</span>
            {isAvailable && product.stock <= 5 && <p className="text-xs text-[#6B7280] mt-0.5">Only {product.stock} left</p>}
            {!isAvailable && <p className="text-xs text-red-500 mt-0.5">Unavailable</p>}
          </div>
          <button onClick={openChat} className="flex items-center gap-1.5 text-xs font-medium text-[#6C47FF] hover:bg-[#F5F2FF] px-3 py-1.5 rounded-full border border-[#6C47FF]/30 transition-colors">
            <MessageCircle className="h-3.5 w-3.5" /> Ask AI
          </button>
        </div>
      </div>
    </article>
  );
}
