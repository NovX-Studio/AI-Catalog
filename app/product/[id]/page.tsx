import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { ArrowLeft, ShoppingCart, Cpu } from "lucide-react";
import { ProductDetailClient } from "./ProductDetailClient";
import { ChatWidget } from "@/components/catalog/ChatWidget";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) notFound();

  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      available: true,
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  let specs: Record<string, string> = {};
  try { specs = JSON.parse(product.specs); } catch {}

  const isAvailable = product.available && product.stock > 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to catalog
        </Link>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="relative aspect-square rounded-3xl bg-zinc-100 overflow-hidden border border-zinc-200/60 shadow-sm">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <svg className="h-20 w-20 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-zinc-400 mt-3">No image available</span>
              </div>
            )}
            <div className="absolute top-4 right-4">
              {isAvailable ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/90 text-white backdrop-blur-sm shadow-sm">
                  In Stock
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/90 text-white backdrop-blur-sm shadow-sm">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-widest mb-2">{product.brand}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-none mb-3">{product.name}</h1>
            <p className="text-zinc-600 leading-relaxed mb-6">{product.description}</p>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-zinc-900 tracking-tight">${product.price.toFixed(2)}</span>
              {product.costPrice > 0 && (
                <span className="text-sm text-zinc-400 line-through">${product.costPrice.toFixed(2)}</span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-8">
              <ShoppingCart className="h-4 w-4 text-zinc-400" />
              {isAvailable ? (
                <span className="text-sm text-zinc-600">
                  {product.stock <= 5
                    ? `Only ${product.stock} left in stock`
                    : `${product.stock} units available`}
                </span>
              ) : (
                <span className="text-sm text-red-500">Currently unavailable</span>
              )}
            </div>

            {isAvailable && (
              <div className="w-full bg-zinc-200 rounded-full h-1.5 mb-8 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                />
              </div>
            )}

            <ProductDetailClient productName={product.name} />

            <div className="mt-auto pt-8 border-t border-zinc-200">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Category</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 text-zinc-700">{product.category.name}</span>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-6">Technical Specifications</h2>
          {Object.keys(specs).length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-zinc-200/60 shadow-sm">
                  <Cpu className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{key}</p>
                    <p className="text-sm font-medium text-zinc-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No specifications available.</p>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-6">Related Products</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} href={`/product/${rp.id}`} className="group bg-white rounded-2xl overflow-hidden border border-zinc-200/60 transition-all duration-300 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5">
                  <div className="relative aspect-[4/3] bg-zinc-100">
                    {rp.imageUrl ? (
                      <Image src={rp.imageUrl} alt={rp.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 33vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">{rp.brand}</p>
                    <h3 className="font-semibold text-zinc-900 text-sm leading-snug mb-1 line-clamp-1">{rp.name}</h3>
                    <p className="text-lg font-bold text-zinc-900 tracking-tight">${rp.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <ChatWidget />
    </div>
  );
}
