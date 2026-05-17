import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SearchBar } from "@/components/catalog/SearchBar";
import { ChatWidget } from "@/components/catalog/ChatWidget";
import { ContactSection } from "@/components/catalog/ContactSection";
import { NavbarLogo } from "@/components/catalog/NavbarLogo";
import { CompareBar } from "@/components/catalog/CompareBar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [rawProducts, categories] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const products = rawProducts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }));
  const topProducts = products.filter((p) => p.available && p.stock > 0).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <NavbarLogo />
            <div className="flex-1 max-w-md mx-auto">
              <SearchBar />
            </div>
            <div className="flex items-center gap-3">
              <Link href="/compare" className="text-sm text-zinc-500 hover:text-emerald-600 transition-colors font-medium">
                Compare
              </Link>
              <a href="/admin/login" className="text-sm text-zinc-500 hover:text-emerald-600 transition-colors font-medium shrink-0">
                Admin
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center min-h-[60dvh] py-20 md:py-28">
            <div className="relative z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
                Curated Collection
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tighter leading-none">
                Products with
                <span className="text-emerald-400 block mt-1">purpose.</span>
              </h1>
              <p className="text-lg text-zinc-400 max-w-lg leading-relaxed">
                Browse our curated catalog of premium electronics. Chat with our AI assistant to find exactly what you need.
              </p>
              <div className="flex gap-3 mt-8">
                <a href="#catalog" className="inline-flex items-center px-5 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                  Browse Products
                </a>
                <a href="#contact" className="inline-flex items-center px-5 py-2.5 rounded-full border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:text-white transition-colors">
                  Get in Touch
                </a>
              </div>
            </div>
            <div className="hidden md:flex relative justify-center">
              <div className="w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl absolute" />
              <div className="relative grid grid-cols-2 gap-3">
                {["S", "M", "L", "XL"].map((size, i) => (
                  <div key={size} className={`rounded-2xl bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm ${i === 0 ? "p-5" : i === 1 ? "p-4" : i === 2 ? "p-4" : "p-5"} flex flex-col gap-2`}>
                    <div className="w-full aspect-square rounded-lg bg-zinc-700/50" />
                    <div className="h-2 w-3/4 rounded-full bg-zinc-700/50" />
                    <div className="h-2 w-1/2 rounded-full bg-emerald-500/30" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {topProducts.length > 0 && (
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Featured Products</h2>
            <p className="text-sm text-zinc-500 mt-1">Our top picks for you</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {topProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group bg-white rounded-2xl overflow-hidden border border-zinc-200/60 transition-all duration-300 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5">
                <div className="relative aspect-[4/3] bg-zinc-100">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/90 text-white backdrop-blur-sm shadow-sm">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider mb-0.5">{product.brand}</p>
                  <h3 className="text-sm font-semibold text-zinc-900 leading-snug mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-base font-bold text-zinc-900 tracking-tight">${product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <main id="catalog" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">All Products</h2>
          <p className="text-sm text-zinc-500 mt-1">{products.length} products in our catalog</p>
        </div>
        <ProductGrid initialProducts={products} categories={categories} />
      </main>

      <ContactSection />
      <footer className="py-8 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <p className="text-sm text-zinc-400">Built by <span className="font-medium text-zinc-500">NovX Studio</span></p>
          <p className="text-sm text-zinc-400">&copy; {new Date().getFullYear()} Catalyx</p>
        </div>
      </footer>
      <ChatWidget />
      <CompareBar />
    </div>
  );
}
