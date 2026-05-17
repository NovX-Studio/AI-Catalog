"use client";

import { useEffect } from "react";
import { useCatalogStore } from "@/lib/store";
import { ProductCard } from "./ProductCard";
import { PackageOpen } from "lucide-react";
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

export function ProductGrid({ initialProducts, categories }: ProductGridProps) {
  const { setProducts, setCategories, filteredProducts, searchQuery, categoryFilter, setCategoryFilter } = useCatalogStore();

  useEffect(() => {
    setProducts(initialProducts);
    setCategories(categories);
  }, [initialProducts, categories, setProducts, setCategories]);

  const products = filteredProducts();

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setCategoryFilter(null)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
            !categoryFilter
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

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
          <PackageOpen className="h-14 w-14 mb-4 text-zinc-300" />
          <p className="text-lg font-semibold text-zinc-500">No products found</p>
          <p className="text-sm mt-1">
            {searchQuery ? `No results for "${searchQuery}"` : "Check back later for new arrivals."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
