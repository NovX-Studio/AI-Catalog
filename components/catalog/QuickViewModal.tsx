"use client";

import Image from "next/image";
import Link from "next/link";
import { useCatalogStore } from "@/lib/store";
import { X, MessageCircle, Cpu, ExternalLink } from "lucide-react";
import { useChatStore } from "@/lib/store";

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct } = useCatalogStore();
  const { openChat, sendMessage } = useChatStore();

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isAvailable = product.available && product.stock > 0;

  let specs: Record<string, string> = {};
  try { specs = JSON.parse(product.specs || "{}"); } catch {}

  async function handleAskAI() {
    setQuickViewProduct(null);
    openChat();
    await sendMessage(`Tell me more about the ${product.name}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setQuickViewProduct(null)} />
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl transition-all duration-200 scale-100 opacity-100">
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-colors shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square md:aspect-auto md:h-full min-h-[280px] bg-zinc-100 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="h-16 w-16 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="absolute top-3 left-3">
              {isAvailable ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/90 text-white backdrop-blur-sm shadow-sm">In Stock</span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/90 text-white backdrop-blur-sm shadow-sm">Out of Stock</span>
              )}
            </div>
          </div>

          <div className="p-6 flex flex-col">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">{product.brand}</p>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-2">{product.name}</h2>
            <p className="text-sm text-zinc-500 leading-relaxed mb-4 line-clamp-3">{product.description}</p>

            <p className="text-2xl font-bold text-zinc-900 tracking-tight mb-4">${product.price.toFixed(2)}</p>

            {isAvailable && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Stock: {product.stock}</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${product.stock > 10 ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }} />
                </div>
              </div>
            )}

            {Object.keys(specs).length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Specs</p>
                <div className="space-y-1.5">
                  {Object.entries(specs).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Cpu className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span className="text-xs text-zinc-500"><span className="font-medium text-zinc-700">{key}:</span> {value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto flex flex-col gap-2">
              <Link
                href={`/product/${product.id}`}
                onClick={() => setQuickViewProduct(null)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-zinc-100 text-zinc-700 text-sm font-medium hover:bg-zinc-200 transition-colors active:scale-[0.98]"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View Details
              </Link>
              <button
                onClick={handleAskAI}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors active:scale-[0.98] shadow-sm"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Ask AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
