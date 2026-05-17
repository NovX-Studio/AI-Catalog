import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/products" className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-[#111827]" style={{ letterSpacing: "-0.02em" }}>Edit Product</h1>
        <p className="text-[#6B7280] text-sm mt-0.5">Update the details for <span className="font-medium text-[#111827]">{product.name}</span>.</p>
      </div>

      <ProductForm
        mode="edit"
        initialData={{
          id: product.id,
          name: product.name,
          brand: product.brand,
          description: product.description,
          specs: product.specs,
          price: product.price,
          costPrice: product.costPrice,
          stock: product.stock,
          imageUrl: product.imageUrl ?? "",
          available: product.available,
          categoryId: product.categoryId,
        }}
      />
    </div>
  );
}
