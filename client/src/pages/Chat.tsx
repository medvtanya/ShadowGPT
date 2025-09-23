import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../shared/lib/axiosInstance";
import type { ChatRequest, ChatResponse } from "../types/chat";
import { useToast } from "../shared/ui/Toast";

type Message = {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
  ts: number;
};

const storageKey = (sessionId: string) => `chat-history:${sessionId}`;

export default function Chat() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const toast = useToast();

  const canSend = useMemo(() => {
    return Boolean(sessionId) && !loading && input.trim().length > 0;
  }, [sessionId, loading, input]);

  // Load history
  useEffect(() => {
    if (!sessionId) return;
    try {
      const raw = localStorage.getItem(storageKey(sessionId));
      if (raw) {
        const parsed = JSON.parse(raw) as Message[];
        setMessages(parsed);
      }
    } catch {}
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => {
    const el = listRef.current as unknown as {
      scrollTo?: Function;
      scrollTop?: number;
      scrollHeight?: number;
    } | null;
    if (!el) return;
    if (typeof el.scrollTo === "function") {
      el.scrollTo({ top: (el as any).scrollHeight, behavior: "smooth" });
    } else {
      // jsdom fallback
      (el as any).scrollTop = (el as any).scrollHeight || 0;
    }
  }, [messages.length]);

  // Persist history
  useEffect(() => {
    if (!sessionId) return;
    try {
      localStorage.setItem(storageKey(sessionId), JSON.stringify(messages));
    } catch {}
  }, [messages, sessionId]);

  const resetChat = () => {
    if (!sessionId) return;
    localStorage.removeItem(storageKey(sessionId));
    setMessages([]);
  };

  const send = async () => {
    if (!canSend || !sessionId) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const payload: ChatRequest = { sessionId, question: userMsg.content };
      const { data } = await axiosInstance.post<ChatResponse>(
        "/api/chat",
        payload
      );
      const answer = data?.data?.answer || "Нет ответа";
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "ai",
        content: answer,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: unknown) {
      const err = e as Error & { response?: { data?: { message?: string } } };
      const msg =
        err?.response?.data?.message || err.message || "Ошибка запроса";
      const sysMsg: Message = {
        id: crypto.randomUUID(),
        role: "system",
        content: msg,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, sysMsg]);
      toast.notify(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionId) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Не задан sessionId.</p>
        <button onClick={() => navigate("/")}>Вернуться</button>
      </div>
    );
  }

  return (
    <div className="chat-root">
      {/* Messages */}
      <div ref={listRef} className="messages">
        {messages.length === 0 && (
          <div style={{ color: "var(--muted)" }}>
            Начните диалог. Задайте вопрос по документу.
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                maxWidth: "72%",
                background:
                  m.role === "user" ? "var(--accent)" : "var(--panel)",
                color: m.role === "user" ? "#fff" : "var(--text)",
                border: m.role === "user" ? "none" : "1px solid #223044",
                padding: "10px 12px",
                borderRadius: 12,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ color: "var(--muted)", fontStyle: "italic" }}>
            AI печатает…
          </div>
        )}
      </div>

      {/* Input */}
      <div className="composer">
        <input
          type="text"
          placeholder="Задайте вопрос по документу"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          style={{ flex: 1 }}
        />
        <button
          onClick={send}
          disabled={!canSend}
          style={{ opacity: !canSend ? 0.6 : 1 }}
        >
          Отправить
        </button>
        <button onClick={resetChat} style={{ background: "#2a3a54" }}>
          Сброс
        </button>
      </div>
    </div>
  );
}
