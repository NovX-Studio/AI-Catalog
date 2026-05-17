import Link from "next/link";
import { db } from "@/lib/db";
import { ProductTable } from "@/components/admin/ProductTable";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Package,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalProducts = products.length;
  const inStock = products.filter((p) => p.stock > 0 && p.available).length;
  const outOfStock = products.filter((p) => p.stock === 0 || !p.available).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const stats = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "bg-[#F5F2FF] text-[#6C47FF]",
    },
    {
      label: "In Stock",
      value: inStock,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Out of Stock",
      value: outOfStock,
      icon: AlertCircle,
      color: "bg-red-50 text-red-500",
    },
    {
      label: "Catalog Value",
      value: `$${totalValue.toFixed(0)}`,
      icon: DollarSign,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-bold text-[#111827]"
            style={{ letterSpacing: "-0.02em" }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Manage your product catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className={cn(
            buttonVariants(),
            "bg-[#6C47FF] hover:bg-[#5B3AE8] text-white inline-flex items-center gap-1.5 border-0 shadow-sm"
          )}
        >
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center",
                  color
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <TrendingUp className="h-3.5 w-3.5 text-gray-300" />
            </div>
            <p
              className="text-2xl font-bold text-[#111827]"
              style={{ letterSpacing: "-0.02em" }}
            >
              {value}
            </p>
            <p className="text-xs text-[#6B7280] mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Product table */}
      <div>
        <h2
          className="text-base font-semibold text-[#111827] mb-4"
          style={{ letterSpacing: "-0.01em" }}
        >
          All Products
        </h2>
        <ProductTable products={products} />
      </div>
    </div>
  );
}
