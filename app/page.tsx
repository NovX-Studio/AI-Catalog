import { db } from "@/lib/db";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SearchBar } from "@/components/catalog/SearchBar";
import { ChatWidget } from "@/components/catalog/ChatWidget";
import { ContactSection } from "@/components/catalog/ContactSection";
import { NavbarLogo } from "@/components/catalog/NavbarLogo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <NavbarLogo />
            <div className="flex-1 max-w-md mx-auto">
              <SearchBar />
            </div>
            <a href="/admin/login" className="text-sm text-gray-500 hover:text-[#6C47FF] transition-colors font-medium shrink-0">
              Admin
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-16 px-4"
        style={{ background: "linear-gradient(135deg, #6C47FF 0%, #4F46E5 50%, #7C3AED 100%)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Discover our products
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto" style={{ lineHeight: 1.6 }}>
            Browse our curated catalog and chat with our AI assistant to find exactly what you need.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <ProductGrid initialProducts={products} categories={categories} />
      </main>

      <ContactSection />
      <footer className="py-6 border-t border-gray-100 bg-white">
        <p className="text-center text-sm text-gray-400">Built by <span className="font-medium text-gray-500">NovX Studio</span></p>
      </footer>
      <ChatWidget />
    </div>
  );
}
