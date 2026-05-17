"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductSchema, type ProductInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Link as LinkIcon, ImageOff, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface SpecRow {
  key: string;
  value: string;
}

interface ProductFormProps {
  initialData?: ProductInput & { id?: string };
  mode: "create" | "edit";
}

type ImageMode = "upload" | "url";

export function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductInput, string>>>({});
  const [imageMode, setImageMode] = useState<ImageMode>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductInput>({
    name: initialData?.name ?? "",
    brand: initialData?.brand ?? "",
    description: initialData?.description ?? "",
    specs: initialData?.specs ?? "{}",
    price: initialData?.price ?? 0,
    costPrice: initialData?.costPrice ?? 0,
    stock: initialData?.stock ?? 0,
    imageUrl: initialData?.imageUrl ?? "",
    available: initialData?.available ?? true,
    categoryId: initialData?.categoryId ?? "",
  });

  const [specs, setSpecs] = useState<SpecRow[]>(() => {
    if (initialData?.specs) {
      try {
        const parsed = JSON.parse(initialData.specs);
        return Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const specsObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim()) specsObj[s.key.trim()] = s.value.trim();
    });
    setForm((prev) => ({ ...prev, specs: JSON.stringify(specsObj) }));
  }, [specs]);

  const margin = form.price > 0 && form.costPrice >= 0
    ? ((form.price - form.costPrice) / form.price * 100).toFixed(1)
    : null;

  function handleChange(field: keyof ProductInput, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function addSpec() {
    setSpecs((prev) => [...prev, { key: "", value: "" }]);
  }

  function removeSpec(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSpec(index: number, field: "key" | "value", val: string) {
    setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: val } : s)));
  }

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }
      handleChange("imageUrl", data.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = ProductSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ProductInput, string>> = {};
      for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
        fieldErrors[key as keyof ProductInput] = msgs?.[0];
      }
      setErrors(fieldErrors);
      toast.error("Please fix the form errors");
      return;
    }

    setLoading(true);
    try {
      const url =
        mode === "edit" && initialData?.id
          ? `/api/products/${initialData.id}`
          : "/api/products";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Something went wrong");
        return;
      }

      toast.success(mode === "edit" ? "Product updated!" : "Product created!");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-[#111827]">Product Image</Label>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setImageMode("upload")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all",
                  imageMode === "upload" ? "bg-white text-[#111827] shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Upload className="h-3 w-3" /> Upload
              </button>
              <button
                type="button"
                onClick={() => setImageMode("url")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all",
                  imageMode === "url" ? "bg-white text-[#111827] shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <LinkIcon className="h-3 w-3" /> URL
              </button>
            </div>
          </div>

          {imageMode === "upload" ? (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                dragOver ? "border-[#6C47FF] bg-[#F5F2FF]" : "border-gray-200 hover:border-[#6C47FF]/50 hover:bg-gray-50"
              )}
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-[#6C47FF] animate-spin" />
                  <p className="text-sm text-[#6B7280]">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#F5F2FF] flex items-center justify-center">
                    <Upload className="h-5 w-5 text-[#6C47FF]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Drop image here or <span className="text-[#6C47FF]">browse</span></p>
                    <p className="text-xs text-[#6B7280] mt-0.5">PNG, JPG, WebP up to 5MB</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Input
              type="url"
              value={form.imageUrl ?? ""}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={loading}
              className="rounded-xl border-gray-200 focus:border-[#6C47FF] focus:ring-[#6C47FF]/20"
            />
          )}

          {form.imageUrl && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
              <Image src={form.imageUrl} alt="Preview" fill className="object-cover" onError={() => handleChange("imageUrl", "")} />
              <button type="button" onClick={() => handleChange("imageUrl", "")} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {!form.imageUrl && imageMode === "url" && (
            <div className="flex items-center justify-center w-full aspect-video rounded-xl bg-gray-50 border border-dashed border-gray-200">
              <ImageOff className="h-8 w-8 text-gray-300" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-[#111827]">Product Name</Label>
            <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="e.g. HyperX Cloud III" disabled={loading}
              className="rounded-xl border-gray-200 focus:border-[#6C47FF] focus:ring-[#6C47FF]/20" />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand" className="text-sm font-medium text-[#111827]">Brand</Label>
            <Input id="brand" value={form.brand} onChange={(e) => handleChange("brand", e.target.value)} placeholder="e.g. Logitech" disabled={loading}
              className="rounded-xl border-gray-200 focus:border-[#6C47FF] focus:ring-[#6C47FF]/20" />
            {errors.brand && <p className="text-xs text-red-500">{errors.brand}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium text-[#111827]">Description</Label>
          <textarea id="description" value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Describe the product..." disabled={loading} rows={3}
            className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF] disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors" />
          {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="categoryId" className="text-sm font-medium text-[#111827]">Category</Label>
          <select id="categoryId" value={form.categoryId} onChange={(e) => handleChange("categoryId", e.target.value)} disabled={loading || categories.length === 0}
            className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF] disabled:opacity-50 transition-colors">
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="costPrice" className="text-sm font-medium text-[#111827]">Cost Price ($)</Label>
            <Input id="costPrice" type="number" step="0.01" min="0" value={form.costPrice}
              onChange={(e) => handleChange("costPrice", parseFloat(e.target.value) || 0)} disabled={loading}
              className="rounded-xl border-gray-200 focus:border-[#6C47FF] focus:ring-[#6C47FF]/20" />
            <p className="text-xs text-gray-400">What you paid for it</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-sm font-medium text-[#111827]">Selling Price ($)</Label>
            <Input id="price" type="number" step="0.01" min="0" value={form.price}
              onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)} disabled={loading}
              className="rounded-xl border-gray-200 focus:border-[#6C47FF] focus:ring-[#6C47FF]/20" />
            {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#111827]">Margin</Label>
            <div className="flex h-10 items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-semibold">
              {margin !== null ? (
                <span className={cn(Number(margin) >= 0 ? "text-emerald-600" : "text-red-500")}>{margin}%</span>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="stock" className="text-sm font-medium text-[#111827]">Stock</Label>
            <Input id="stock" type="number" min="0" value={form.stock}
              onChange={(e) => handleChange("stock", parseInt(e.target.value) || 0)} disabled={loading}
              className="rounded-xl border-gray-200 focus:border-[#6C47FF] focus:ring-[#6C47FF]/20" />
            {errors.stock && <p className="text-xs text-red-500">{errors.stock}</p>}
          </div>
          <div className="space-y-1.5 flex items-end pb-1">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input id="available" type="checkbox" checked={form.available ?? true}
                  onChange={(e) => handleChange("available", e.target.checked)} disabled={loading} className="sr-only" />
                <div onClick={() => !loading && handleChange("available", !form.available)}
                  className={cn("w-10 h-6 rounded-full cursor-pointer transition-colors", form.available ? "bg-[#6C47FF]" : "bg-gray-200")}>
                  <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm mt-1 transition-transform", form.available ? "translate-x-5" : "translate-x-1")} />
                </div>
              </div>
              <Label htmlFor="available" className="cursor-pointer text-sm text-[#374151]">Available for sale</Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-[#111827]">Specifications</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSpec}
              className="rounded-xl border-gray-200 text-[#6C47FF] hover:bg-[#F5F2FF] text-xs gap-1 h-8">
              <Plus className="h-3 w-3" /> Add Specification
            </Button>
          </div>
          {specs.length === 0 && (
            <p className="text-xs text-gray-400 italic">No specifications added yet.</p>
          )}
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Input value={spec.key} onChange={(e) => updateSpec(i, "key", e.target.value)} placeholder="Key (e.g. Connectivity)" disabled={loading}
                className="rounded-xl border-gray-200 focus:border-[#6C47FF] focus:ring-[#6C47FF]/20 text-sm flex-1" />
              <Input value={spec.value} onChange={(e) => updateSpec(i, "value", e.target.value)} placeholder="Value (e.g. Bluetooth 5.3)" disabled={loading}
                className="rounded-xl border-gray-200 focus:border-[#6C47FF] focus:ring-[#6C47FF]/20 text-sm flex-1" />
              <button type="button" onClick={() => removeSpec(i)} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}
            className="rounded-xl border-gray-200 text-[#374151] hover:bg-gray-50">Cancel</Button>
          <Button type="submit" disabled={loading || uploading}
            className="flex-1 rounded-xl bg-[#6C47FF] hover:bg-[#5B3AE8] text-white border-0 shadow-sm">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />{mode === "edit" ? "Updating..." : "Creating..."}</>
            ) : mode === "edit" ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
