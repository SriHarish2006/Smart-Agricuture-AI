import { FormEvent, useEffect, useState } from "react";
import { MessageCircleQuestion, Send, Bot, User } from "lucide-react";
import { api, ApiError } from "../services/api";
import type { ChatQuestion } from "../types";
import ErrorBanner from "../components/ErrorBanner";

interface Message {
  role: "bot" | "user";
  text: string;
  matched?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  fertilizer: "🌾",
  irrigation: "💧",
  disease: "🌿",
  pest: "🐛",
  weather: "🌦️",
};

export default function Chatbot() {
  const [crops, setCrops] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [questions, setQuestions] = useState<ChatQuestion[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hello! Select a question below, or type your own agriculture question." },
  ]);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getChatCrops().then(setCrops).catch(() => {});
  }, []);

  useEffect(() => {
    api.getChatQuestions(selectedCrop || undefined).then(setQuestions).catch(() => setError("Unable to load questions."));
  }, [selectedCrop]);

  async function ask(question: string) {
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setAsking(true);
    setError(null);
    try {
      const res = await api.askChatbot(question, selectedCrop || undefined);
      setMessages((prev) => [...prev, { role: "bot", text: res.answer, matched: res.matched }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to get an answer right now.");
    } finally {
      setAsking(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput("");
    ask(q);
  }

  const grouped = questions.reduce<Record<string, ChatQuestion[]>>((acc, q) => {
    (acc[q.category] ||= []).push(q);
    return acc;
  }, {});

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold text-canopy-950 flex items-center gap-2">
          <MessageCircleQuestion className="text-canopy-600" /> Agriculture Assistant
        </h1>

        <div className="rounded-2xl border border-canopy-200 bg-white flex flex-col h-[520px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-canopy-600 text-cream flex items-center justify-center shrink-0">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user" ? "bg-canopy-600 text-cream rounded-br-sm" : "bg-canopy-50 text-canopy-950 rounded-bl-sm border border-canopy-100"
                  }`}
                >
                  {m.text}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-harvest-500 text-canopy-950 flex items-center justify-center shrink-0">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            {asking && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-canopy-600 text-cream flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-canopy-50 border border-canopy-100 px-4 py-2.5 text-sm text-canopy-700">
                  🤖 Finding the best answer...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-canopy-200 p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your agriculture question..."
              className="flex-1 rounded-full border border-canopy-300 px-4 py-2.5 text-sm focus:border-canopy-500 outline-none"
            />
            <button
              type="submit"
              disabled={asking || !input.trim()}
              className="rounded-full bg-canopy-600 hover:bg-canopy-700 disabled:opacity-60 text-cream p-2.5 transition-colors"
              aria-label="Ask"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

        {error && <ErrorBanner message={error} />}
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-canopy-200 bg-white p-4">
          <label className="block">
            <span className="text-sm font-medium text-canopy-900">Select Crop</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="mt-1 w-full rounded-xl border border-canopy-300 px-3.5 py-2.5 text-sm focus:border-canopy-500 outline-none bg-white"
            >
              <option value="">All / General</option>
              {crops.map((c) => (
                <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-2xl border border-canopy-200 bg-white p-4 max-h-[420px] overflow-y-auto space-y-4">
          {Object.entries(grouped).map(([category, qs]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-canopy-600 uppercase tracking-wide mb-2">
                {CATEGORY_ICONS[category] || "🌱"} {category}
              </p>
              <div className="flex flex-col gap-1.5">
                {qs.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => ask(q.question)}
                    disabled={asking}
                    className="text-left text-sm rounded-lg px-3 py-2 border border-canopy-100 hover:border-canopy-400 hover:bg-canopy-50 transition-colors disabled:opacity-60"
                  >
                    {q.question}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {questions.length === 0 && <p className="text-sm text-canopy-600">No predefined questions for this selection yet.</p>}
        </div>
      </div>
    </div>
  );
}
