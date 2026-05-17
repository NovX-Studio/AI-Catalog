"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ShoppingCart, TrendingUp, DollarSign, Package } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  costPrice: number;
  stock: number;
  category: { name: string };
}

interface Sale {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
  product: Product;
}

interface SaleRecord {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export default function SalesPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [form, setForm] = useState<SaleRecord>({
    productId: "",
    quantity: 1,
    unitPrice: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then(r => r.json()),
      fetch("/api/sales").then(r => r.json()),
    ]).then(([productsData, salesData]) => {
      setProducts(productsData);
      setSales(salesData);
    }).catch(() => {
      toast.error("Failed to load data");
    }).finally(() => setLoading(false));
  }, []);

  const selectedProduct = products.find(p => p.id === form.productId);

  function handleProductChange(id: string) {
    const product = products.find(p => p.id === id);
    setForm({
      productId: id,
      quantity: 1,
      unitPrice: product?.price ?? 0,
    });
  }

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalCost = sales.reduce((sum, s) => {
    const product = products.find(p => p.id === s.productId);
    return sum + (product ? product.costPrice * s.quantity : 0);
  }, 0);

  const paginatedSales = sales.slice(0, page * pageSize);
  const hasMore = sales.length > page * pageSize;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId) {
      toast.error("Please select a product");
      return;
    }
    if (form.quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (selectedProduct && form.quantity > selectedProduct.stock) {
      toast.error(`Cannot sell more than available stock (${selectedProduct.stock})`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to register sale");
        return;
      }

      toast.success("Sale registered!");
      setForm({ productId: "", quantity: 1, unitPrice: 0 });

      const [productsData, salesData] = await Promise.all([
        fetch("/api/products").then(r => r.json()),
        fetch("/api/sales").then(r => r.json()),
      ]);
      setProducts(productsData);
      setSales(salesData);
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-[#6C47FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]" style={{ letterSpacing: "-0.02em" }}>Sales</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Register and track your product sales.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
          { label: "Total Cost", value: `$${totalCost.toFixed(2)}`, icon: ShoppingCart, color: "bg-red-50 text-red-500" },
          { label: "Net Profit", value: `$${(totalRevenue - totalCost).toFixed(2)}`, icon: TrendingUp, color: (totalRevenue - totalCost) >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500" },
          { label: "Total Sales", value: sales.length, icon: Package, color: "bg-[#F5F2FF] text-[#6C47FF]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", color)}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#111827]" style={{ letterSpacing: "-0.02em" }}>{value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="text-base font-semibold text-[#111827] mb-4" style={{ letterSpacing: "-0.01em" }}>Register a Sale</h2>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <Label className="text-sm font-medium text-[#111827]">Product</Label>
            <select value={form.productId} onChange={(e) => handleProductChange(e.target.value)}
              className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF]">
              <option value="">Select product</option>
              {products.filter(p => p.stock > 0).map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.brand}) — Stock: {p.stock}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 w-24">
            <Label className="text-sm font-medium text-[#111827]">Qty</Label>
            <Input type="number" min="1" max={selectedProduct?.stock ?? 1} value={form.quantity}
              onChange={(e) => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
              className="rounded-xl border-gray-200 focus:border-[#6C47FF] focus:ring-[#6C47FF]/20" />
          </div>
          <div className="space-y-1.5 w-36">
            <Label className="text-sm font-medium text-[#111827]">Unit Price ($)</Label>
            <Input type="number" step="0.01" min="0" value={form.unitPrice}
              onChange={(e) => setForm(f => ({ ...f, unitPrice: parseFloat(e.target.value) || 0 }))}
              className="rounded-xl border-gray-200 focus:border-[#6C47FF] focus:ring-[#6C47FF]/20" />
          </div>
          <Button type="submit" disabled={submitting || !form.productId}
            className="rounded-xl bg-[#6C47FF] hover:bg-[#5B3AE8] text-white border-0 shadow-sm h-10">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register Sale"}
          </Button>
        </form>
      </div>

      <div>
        <h2 className="text-base font-semibold text-[#111827] mb-4" style={{ letterSpacing: "-0.01em" }}>Sales History</h2>
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-100">
                <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Date</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Product</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Qty</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Unit Price</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Total</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-[#6B7280] text-sm">
                    No sales recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSales.map((sale) => {
                  const cost = (sale.product?.costPrice ?? 0) * sale.quantity;
                  const profit = sale.total - cost;
                  return (
                    <TableRow key={sale.id} className="hover:bg-[#FAFAFA] border-b border-gray-50 last:border-0">
                      <TableCell className="text-sm text-[#6B7280]">{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium text-[#111827] text-sm">{sale.product?.name ?? "Unknown"}</TableCell>
                      <TableCell className="text-[#374151] text-sm">{sale.quantity}</TableCell>
                      <TableCell className="text-[#374151] text-sm">${sale.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-[#374151] text-sm font-medium">${sale.total.toFixed(2)}</TableCell>
                      <TableCell className={cn("text-sm font-medium", profit >= 0 ? "text-emerald-600" : "text-red-500")}>
                        ${profit.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={() => setPage(p => p + 1)}
              className="rounded-xl border-gray-200 text-[#374151]">
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
