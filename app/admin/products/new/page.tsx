import { ProductForm } from "@/components/admin/ProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Add New Product
        </h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Fill in the details to add a new product to your catalog.
        </p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
