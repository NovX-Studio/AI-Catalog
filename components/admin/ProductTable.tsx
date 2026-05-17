"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  available: boolean;
}

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(0, page * pageSize);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete product");
        return;
      }
      toast.success("Product deleted");
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
          />
        </div>
        <p className="text-xs text-zinc-400">{filtered.length} of {products.length}</p>
      </div>

      <div className="rounded-2xl border border-zinc-200/60 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 hover:bg-zinc-50 border-b border-zinc-100">
              <TableHead className="w-14 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Image</TableHead>
              <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Name</TableHead>
              <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Price</TableHead>
              <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Stock</TableHead>
              <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-zinc-500 text-sm">
                  {search ? "No products match your search." : "No products yet. Add your first product!"}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((product) => (
                <TableRow key={product.id} className="hover:bg-zinc-50/50 border-b border-zinc-50 last:border-0">
                  <TableCell>
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-zinc-100">
                      {product.imageUrl ? (
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px] font-medium">N/A</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-zinc-900 text-sm">{product.name}</TableCell>
                  <TableCell className="text-zinc-700 text-sm font-medium">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-zinc-700 text-sm">{product.stock}</TableCell>
                  <TableCell>
                    {product.available && product.stock > 0 ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 text-xs font-medium">In Stock</Badge>
                    ) : (
                      <Badge className="bg-red-50 text-red-600 border-red-100 hover:bg-red-50 text-xs font-medium">Out of Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors outline-none" aria-label="Product actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="bottom">
                        <DropdownMenuItem onClick={() => router.push(`/admin/products/${product.id}/edit`)} className="cursor-pointer">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(product.id)} className="cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-zinc-400">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className={cn("w-8 h-8 rounded-xl flex items-center justify-center border border-zinc-200 text-xs transition-colors", page === 1 ? "text-zinc-300 cursor-not-allowed" : "text-zinc-600 hover:border-zinc-300")}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={cn("w-8 h-8 rounded-xl text-xs font-medium transition-colors", page === p ? "bg-emerald-500 text-white" : "text-zinc-600 border border-zinc-200 hover:border-zinc-300")}>{p}</button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={cn("w-8 h-8 rounded-xl flex items-center justify-center border border-zinc-200 text-xs transition-colors", page === totalPages ? "text-zinc-300 cursor-not-allowed" : "text-zinc-600 hover:border-zinc-300")}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this product? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
