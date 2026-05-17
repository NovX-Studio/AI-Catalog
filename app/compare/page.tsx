"use client";

import Link from "next/link";
import Image from "next/image";
import { useCatalogStore } from "@/lib/store";
import { ArrowLeft, Cpu, CheckCircle2, XCircle } from "lucide-react";
import { ChatWidget } from "@/components/catalog/ChatWidget";

export default function ComparePage() {
  const { compareIds, products, clearCompare } = useCatalogStore();
  const compareProducts = products.filter((p) => compareIds.includes(p.id));

  const specs: Record<string, string>[] = [];
  compareProducts.forEach((p) => {
    try { specs.push(JSON.parse(p.specs || "{}")); }
    catch { specs.push({}); }
  });

  const allSpecKeys = [...new Set(specs.flatMap((s) => Object.keys(s)))];

  if (compareProducts.length < 2) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <Cpu className="h-14 w-14 mx-auto mb-4 text-zinc-300" />
          <h1 className="text-xl font-bold text-zinc-900 mb-2">Compare Products</h1>
          <p className="text-sm text-zinc-500 mb-6">Select at least 2 products to compare them side by side.</p>
          <Link href="/" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Compare Products</h1>
          </div>
          <button onClick={clearCompare} className="text-sm text-zinc-500 hover:text-zinc-700 underline">
            Clear all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-36 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider pb-4 pr-4" />
                {compareProducts.map((p) => (
                  <th key={p.id} className="text-left pb-4 px-3 min-w-[220px]">
                    <div className="bg-white rounded-2xl overflow-hidden border border-zinc-200/60 shadow-sm">
                      <div className="relative aspect-[4/3] bg-zinc-100">
                        {p.imageUrl ? (
                          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="33vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider mb-0.5">{p.brand}</p>
                        <Link href={`/product/${p.id}`} className="text-sm font-semibold text-zinc-900 hover:text-emerald-600 transition-colors line-clamp-1">{p.name}</Link>
                        <p className="text-lg font-bold text-zinc-900 tracking-tight mt-1">${p.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200">
                <td className="py-3 pr-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Availability</td>
                {compareProducts.map((p) => (
                  <td key={p.id} className="py-3 px-3">
                    {p.available && p.stock > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> In Stock ({p.stock})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500">
                        <XCircle className="h-3.5 w-3.5" /> Out of Stock
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              {allSpecKeys.map((key) => (
                <tr key={key} className="border-b border-zinc-100 last:border-0">
                  <td className="py-3 pr-4 text-xs font-medium text-zinc-500">{key}</td>
                  {specs.map((s, i) => (
                    <td key={i} className="py-3 px-3 text-sm text-zinc-700">{s[key] || "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
