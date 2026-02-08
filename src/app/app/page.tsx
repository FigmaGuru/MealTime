"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { format, startOfWeek } from "date-fns";
import { Send, Loader2, MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMeals } from "@/hooks/use-meals";
import { useWeeklyPlan } from "@/hooks/use-weekly-plan";
import { buildMealChatContext } from "@/lib/utils/chat-context";
import type { MealChatContext, CreateMealInput } from "@/types";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  addMeal?: CreateMealInput;
  addMealDone?: boolean;
};

const SUGGESTED_PROMPTS = [
  "What's for dinner tonight?",
  "What's planned this week?",
  "What are my favorite meals?",
  "What's in my meal library?",
  "Suggest a quick meal and add it to my library",
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(userContent: string) {
    const trimmed = userContent.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, context }),
      });

      const data = await res.json();
      const reply =
        res.ok && data.reply
          ? data.reply
          : data.error ?? "Something went wrong. Try again.";
      const addMealPayload = res.ok && data.addMeal ? data.addMeal : undefined;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, addMeal: addMealPayload },
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
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <div className="flex-1 overflow-y-auto px-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Ask about your meals</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                What's for dinner, what's planned this week, your favorites, and more.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="text-left"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-6 py-6">
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

      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-background px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto flex max-w-2xl gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your meals or plan…"
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
