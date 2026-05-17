"use client";

import { useChatStore } from "@/lib/store";
import { MessageCircle } from "lucide-react";

export function ProductDetailClient({ productName }: { productName: string }) {
  const { openChat, sendMessage } = useChatStore();

  async function handleAskAI() {
    openChat();
    await sendMessage(`Tell me more about the ${productName}`);
  }

  return (
    <button
      onClick={handleAskAI}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 mb-8"
    >
      <MessageCircle className="h-4 w-4" />
      Ask AI about this product
    </button>
  );
}
