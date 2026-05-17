"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "model";
  text: string;
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce-dot"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

export default function AdminChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    setMessages(prev => [...prev, { role: "user", text }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMessages(prev => [...prev, { role: "model", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "model", text: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-6">
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#F5F2FF] flex items-center justify-center">
              <Bot className="h-5 w-5 text-[#6C47FF]" />
            </div>
            <div>
              <p className="font-semibold text-[#111827] text-sm">AI Business Assistant</p>
              <p className="text-xs text-[#6B7280]">Ask about sales, products, and insights</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setMessages([])}
            className="rounded-xl border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 text-xs gap-1 h-8">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#F5F2FF] flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-[#6C47FF]" />
              </div>
              <p className="font-semibold text-gray-700">Ask me anything about your business</p>
              <p className="text-sm text-gray-400 mt-1 max-w-md">
                I can answer questions about sales, revenue, product performance, stock levels, and give business recommendations.
              </p>
              <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-lg">
                {[
                  "What's my total revenue?",
                  "Which products sell best?",
                  "Any low stock alerts?",
                  "What's my profit margin?",
                  "Compare this month vs last",
                  "Which category performs best?",
                ].map((q) => (
                  <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    disabled={isLoading}
                    className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-[#6C47FF] hover:text-[#6C47FF] transition-colors disabled:opacity-50">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[75%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === "user"
                  ? "rounded-2xl rounded-br-md text-white"
                  : "rounded-2xl rounded-bl-md bg-white border border-gray-100 text-gray-800 shadow-sm"
              )}
                style={msg.role === "user" ? { background: "linear-gradient(135deg, #6C47FF 0%, #7C3AED 100%)" } : {}}>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex gap-2 shrink-0">
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your business data..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#6C47FF]/30 focus:border-[#6C47FF] focus:bg-white transition-all disabled:opacity-50" />
          <button type="submit" disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 shrink-0"
            style={{ background: "linear-gradient(135deg, #6C47FF 0%, #7C3AED 100%)" }}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
