"use client";

import Link from "next/link";
import { useCatalogStore } from "@/lib/store";
import { BarChart3, X } from "lucide-react";

export function CompareBar() {
  const { compareIds, products, toggleCompare, clearCompare } = useCatalogStore();

  if (compareIds.length === 0) return null;

  const compareProducts = products.filter((p) => compareIds.includes(p.id));

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl backdrop-blur-md">
        <BarChart3 className="h-4 w-4 text-emerald-400" />
        <span className="text-sm text-zinc-300 font-medium">
          {compareIds.length} product{compareIds.length !== 1 ? "s" : ""} selected
        </span>
        <div className="flex items-center gap-1.5">
          {compareProducts.map((p) => (
            <span key={p.id} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-300">
              {p.name.substring(0, 12)}{p.name.length > 12 ? "…" : ""}
              <button onClick={() => toggleCompare(p.id)} className="text-zinc-500 hover:text-zinc-200 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <Link
          href="/compare"
          className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors active:scale-95"
        >
          Compare
        </Link>
        <button onClick={clearCompare} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Clear
        </button>
      </div>
    </div>
  );
}
