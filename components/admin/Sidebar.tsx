"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, PlusCircle, ShoppingCart, BarChart3, Bot, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/products/new", label: "Add Product", icon: PlusCircle },
  { href: "/admin/sales", label: "Sales", icon: ShoppingCart },
  { href: "/admin/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/admin/chat", label: "AI Assistant", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    router.push("/admin/login");
  }

  function isActive(href: string) {
    if (href === "/admin/dashboard") {
      return pathname === href || pathname === "/admin";
    }
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex flex-col w-64 bg-zinc-950 text-white min-h-screen">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
          <Package className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-base tracking-tight">
          Catalyx
        </span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/20 px-3 mb-3">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
