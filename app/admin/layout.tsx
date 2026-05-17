"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { Package, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-zinc-950 text-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Package className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">Catalyx</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "text-white hover:bg-white/10"
              )}
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-64 bg-zinc-950 border-white/5"
              showCloseButton={false}
            >
              <Sidebar />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
