import { ProductForm } from "@/components/admin/ProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1
          className="text-2xl font-bold text-[#111827]"
          style={{ letterSpacing: "-0.02em" }}
        >
          Add New Product
        </h1>
        <p className="text-[#6B7280] text-sm mt-0.5">
          Fill in the details to add a new product to your catalog.
        </p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
