"use client";

import { useEffect, useState } from "react";
import { useCatalogStore } from "@/lib/store";
import { ProductCard } from "./ProductCard";
import { QuickViewModal } from "./QuickViewModal";
import { PackageOpen, ArrowUpDown, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductGridProps {
  initialProducts: Product[];
  categories: Category[];
}

type SortField = "name" | "price" | "createdAt";
type SortOrder = "asc" | "desc";

export function ProductGrid({ initialProducts, categories }: ProductGridProps) {
  const {
    setProducts, setCategories,
    filteredProducts, paginatedProducts, totalPages,
    searchQuery, categoryFilter, setCategoryFilter,
    page, setPage, sortField, sortOrder, setSortField, setSortOrder,
    minPrice, maxPrice, setMinPrice, setMaxPrice,
  } = useCatalogStore();

  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  useEffect(() => {
    setProducts(initialProducts);
    setCategories(categories);
  }, [initialProducts, categories, setProducts, setCategories]);

  const products = paginatedProducts();
  const total = totalPages();

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  }

  function applyPriceFilter() {
    setMinPrice(priceMin ? parseFloat(priceMin) : null);
    setMaxPrice(priceMax ? parseFloat(priceMax) : null);
  }

  function clearPriceFilter() {
    setMinPrice(null);
    setMaxPrice(null);
    setPriceMin("");
    setPriceMax("");
    setShowPriceFilter(false);
  }

  const hasActiveFilters = categoryFilter || minPrice !== null || maxPrice !== null;
  const sortLabel = { name: "Name", price: "Price", createdAt: "Newest" };

  return (
    <div>
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => setCategoryFilter(null)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
            !categoryFilter && !minPrice && !maxPrice
              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
              : "bg-white text-zinc-600 border-zinc-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50"
          )}>
          All
        </button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setCategoryFilter(cat.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
              categoryFilter === cat.id
                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50"
            )}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-1 py-0.5">
            {(["createdAt", "name", "price"] as SortField[]).map((field) => (
              <button
                key={field}
                onClick={() => toggleSort(field)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all",
                  sortField === field
                    ? "bg-zinc-100 text-zinc-800"
                    : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                {sortLabel[field]}
                {sortField === field && (
                  sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                )}
              </button>
            ))}
          </div>

          {/* Price filter toggle */}
          <button
            onClick={() => setShowPriceFilter(!showPriceFilter)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              minPrice !== null || maxPrice !== null
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
            )}
          >
            Price
          </button>
        </div>

        <p className="text-xs text-zinc-400">{filteredProducts().length} products</p>
      </div>

      {/* Price filter panel */}
      {showPriceFilter && (
        <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-white border border-zinc-200/60 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Min</span>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="$0"
              className="w-24 px-3 py-1.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              min="0"
              step="0.01"
            />
          </div>
          <span className="text-zinc-300">—</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Max</span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="$9999"
              className="w-24 px-3 py-1.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              min="0"
              step="0.01"
            />
          </div>
          <button onClick={applyPriceFilter} className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors active:scale-95">
            Apply
          </button>
          {(minPrice !== null || maxPrice !== null) && (
            <button onClick={clearPriceFilter} className="text-xs text-zinc-400 hover:text-zinc-600 underline">
              Clear
            </button>
          )}
        </div>
      )}

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {categoryFilter && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              {categories.find(c => c.id === categoryFilter)?.name}
              <button onClick={() => setCategoryFilter(null)} className="hover:text-emerald-900"><X className="h-3 w-3" /></button>
            </span>
          )}
          {(minPrice !== null || maxPrice !== null) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              ${minPrice ?? 0} — ${maxPrice ?? "∞"}
              <button onClick={clearPriceFilter} className="hover:text-emerald-900"><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
          <PackageOpen className="h-14 w-14 mb-4 text-zinc-300" />
          <p className="text-lg font-semibold text-zinc-500">No products found</p>
          <p className="text-sm mt-1">
            {searchQuery ? `No results for "${searchQuery}"` : "Check back later for new arrivals."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "w-9 h-9 rounded-xl text-sm font-medium transition-all",
                    page === p
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:border-emerald-300 hover:text-emerald-600"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <QuickViewModal />
    </div>
  );
}
