"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { format, startOfWeek } from "date-fns";
import {
  Loader2,
  MessageCircle,
  Plus,
  SquarePen,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMeals } from "@/hooks/use-meals";
import { useWeeklyPlan } from "@/hooks/use-weekly-plan";
import { buildMealChatContext } from "@/lib/utils/chat-context";
import { chatWithAI } from "@/lib/openai/services";
import type { MealChatContext, CreateMealInput } from "@/types";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  addMeal?: CreateMealInput;
  addMealDone?: boolean;
};

const SUGGESTED_PROMPTS = [
  { label: "What's for dinner tonight?", icon: "🍽️" },
  { label: "What's planned this week?", icon: "📅" },
  { label: "Suggest a quick weeknight meal", icon: "⚡" },
  { label: "What are my favorite meals?", icon: "❤️" },
  { label: "Add a new pasta dish to my library", icon: "🍝" },
  { label: "What meals haven't I made recently?", icon: "🔄" },
];

export default function ChatHomePage() {
  const { meals, addMeal } = useMeals();
  const currentWeekISO = useMemo(
    () => format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    []
  );
  const { days } = useWeeklyPlan(currentWeekISO);
  const todayISO = format(new Date(), "yyyy-MM-dd");

  const context = useMemo<MealChatContext>(
    () => buildMealChatContext(meals, days, todayISO),
    [meals, days, todayISO]
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  async function sendMessage(userContent: string) {
    const trimmed = userContent.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const data = await chatWithAI(trimmed, context);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, addMeal: data.addMeal },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleNewChat() {
    setMessages([]);
    setInput("");
    setLoading(false);
  }

  async function handleAddToLibrary(
    payload: CreateMealInput,
    messageIndex: number
  ) {
    const id = await addMeal(payload);
    if (id !== undefined) {
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === messageIndex && msg.role === "assistant" && msg.addMeal
            ? { ...msg, addMealDone: true }
            : msg
        )
      );
    }
  }

  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-0 flex-col -mx-4 sm:-mx-6 lg:-mx-8 -mb-6">
      {/* Top bar with new chat button (only shown when in conversation) */}
      {messages.length > 0 && (
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">Chat</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            className="gap-1.5 text-muted-foreground"
          >
            <SquarePen className="h-4 w-4" />
            New chat
          </Button>
        </div>
      )}

      {/* Messages area */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Ask about your meals</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                What&apos;s for dinner, what&apos;s planned this week, your favorites, and more.
              </p>
            </div>
            <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => sendMessage(prompt.label)}
                  disabled={loading}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <span className="shrink-0 text-base">{prompt.icon}</span>
                  <span className="line-clamp-1">{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4 px-4 py-4 sm:space-y-6 sm:py-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    msg.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground"
                      : "max-w-[85%] rounded-2xl rounded-bl-md border border-border bg-muted/50 px-4 py-2.5 text-sm"
                  }
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.role === "assistant" && msg.addMeal && !msg.addMealDone && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleAddToLibrary(msg.addMeal!, i)}
                        className="gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add to library
                      </Button>
                    </div>
                  )}
                  {msg.role === "assistant" && msg.addMeal && msg.addMealDone && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Added to your library.
                    </p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-muted/50 px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat input */}
      <div className="shrink-0 border-t border-border bg-background px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
          <div className="relative flex items-end rounded-xl border border-border bg-muted/30 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 transition-[border-color,box-shadow]">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your meals or plan…"
              disabled={loading}
              rows={1}
              className="min-h-0 flex-1 resize-none border-0 bg-transparent py-3 pl-4 pr-12 shadow-none focus-visible:ring-0 focus-visible:border-transparent"
            />
            <Button
              type="submit"
              size="icon-sm"
              disabled={loading || !input.trim()}
              className="absolute right-2 bottom-2 rounded-lg"
            >
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground/60">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
