import Link from "next/link";
import { db } from "@/lib/db";
import { ProductTable } from "@/components/admin/ProductTable";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusCircle, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const productsForTable = products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    imageUrl: p.imageUrl,
    available: p.available,
  }));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Products</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{products.length} products in catalog</p>
        </div>
        <Link href="/admin/products/new" className={cn(buttonVariants(), "bg-emerald-500 hover:bg-emerald-600 text-white inline-flex items-center gap-1.5 border-0 shadow-sm")}>
          <PlusCircle className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Products", value: products.length, icon: Package, color: "bg-emerald-50 text-emerald-600" },
          { label: "In Stock", value: products.filter(p => p.stock > 0 && p.available).length, icon: Package, color: "bg-emerald-50 text-emerald-600" },
          { label: "Out of Stock", value: products.filter(p => p.stock === 0 || !p.available).length, icon: Package, color: "bg-red-50 text-red-500" },
          { label: "Total Value", value: `$${products.reduce((sum, p) => sum + p.price * p.stock, 0).toFixed(0)}`, icon: Package, color: "bg-amber-50 text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-zinc-200/60 shadow-sm">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", color)}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 tracking-tight">{value}</p>
            <p className="text-xs text-zinc-500 mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <ProductTable products={productsForTable} />
    </div>
  );
}
