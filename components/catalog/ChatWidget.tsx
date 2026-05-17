"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/lib/store";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-zinc-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatWidget() {
  const { messages, isOpen, isLoading, toggleChat, sendMessage } =
    useChatStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasOpened(true);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden transition-all duration-300",
          isOpen
            ? "opacity-100 scale-100 w-[380px] h-[520px] sm:w-[400px]"
            : "opacity-0 scale-95 w-0 h-0 pointer-events-none"
        )}
      >
        <div className="px-4 py-3.5 flex items-center justify-between shrink-0 bg-emerald-500">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none mb-0.5">
                AI Assistant
              </p>
              <p className="text-white/70 text-xs">Always here to help</p>
            </div>
          </div>
          <button
            onClick={toggleChat}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <Bot className="h-7 w-7 text-emerald-500" />
              </div>
              <p className="font-semibold text-zinc-700 text-sm">
                Hi! I&apos;m your AI shopping assistant
              </p>
              <p className="text-xs text-zinc-400 mt-1 max-w-[220px]">
                Ask me about products, prices, availability or anything else!
              </p>
              <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                {[
                  "What's available?",
                  "Cheapest product?",
                  "What's in stock?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="text-xs px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 hover:border-emerald-300 hover:text-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[82%] px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "rounded-2xl rounded-br-md text-white bg-emerald-500"
                    : "rounded-2xl rounded-bl-md bg-white border border-zinc-100 text-zinc-800 shadow-sm"
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="p-3 border-t border-zinc-100 bg-white flex gap-2 shrink-0"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about our products..."
            disabled={isLoading}
            className="flex-1 px-3.5 py-2 text-sm rounded-full border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white transition-all hover:bg-emerald-600 disabled:opacity-40 shrink-0 active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      <button
        onClick={toggleChat}
        className={cn(
          "w-14 h-14 rounded-full text-white shadow-lg transition-all duration-200 flex items-center justify-center",
          !hasOpened && "animate-pulse-chat",
          isOpen ? "bg-zinc-700 hover:bg-zinc-600" : "bg-emerald-500 hover:bg-emerald-600"
        )}
        aria-label={isOpen ? "Close chat" : "Open AI chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
