"use client";

import { useId, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

const WELCOME: Record<"dashboard" | "search", string> = {
  dashboard:
    "Hello. Ask me anything about UK financial regulations — FCA/PRA updates, compliance deadlines, or what changes mean for your business.",
  search:
    "Search above or ask me anything about UK financial regulation. I can summarise legal text, explain compliance implications, and compare jurisdictions.",
};

// Calls Bravo Ai's own /api/query route. The Gemini API key remains server-side;
// a 501 with an explanatory message means GEMINI_API_KEY isn't configured.
async function askQuery(question: string): Promise<string> {
  const res = await fetch("/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? `API error ${res.status}`);
  return data?.answer ?? "";
}

export default function QAPanel({
  variant,
  prefill,
  onPrefillConsumed,
}: {
  variant: "dashboard" | "search";
  prefill?: string;
  onPrefillConsumed?: () => void;
}) {
  const uid = useId();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: `${uid}-welcome`, role: "ai", text: WELCOME[variant] },
  ]);
  const [input, setInput] = useState(prefill ?? "");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Sync external prefill (Search page's quick-question buttons) only when the
  // prop itself changes — comparing against `input` would fight user typing.
  const [lastPrefill, setLastPrefill] = useState(prefill);
  if (prefill !== undefined && prefill !== lastPrefill) {
    setLastPrefill(prefill);
    setInput(prefill);
  }

  async function ask() {
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    onPrefillConsumed?.();
    setMessages((m) => [...m, { id: `${uid}-${Date.now()}-u`, role: "user", text: question }]);
    setBusy(true);
    const loadingId = `${uid}-${Date.now()}-loading`;
    setMessages((m) => [...m, { id: loadingId, role: "ai", text: "…" }]);
    try {
      const answer = await askQuery(question);
      setMessages((m) => m.filter((x) => x.id !== loadingId).concat({ id: `${loadingId}-a`, role: "ai", text: answer }));
    } catch (err) {
      setMessages((m) =>
        m
          .filter((x) => x.id !== loadingId)
          .concat({
            id: `${loadingId}-e`,
            role: "ai",
            text: err instanceof Error ? err.message : "Something went wrong.",
            error: true,
          }),
      );
    } finally {
      setBusy(false);
      requestAnimationFrame(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      });
    }
  }

  return (
    <div className="qa-panel">
      <div className="qa-header">
        <span className="qa-icon">✦</span>
        <span className="qa-title">{variant === "dashboard" ? "Ask the Regulation AI" : "AI Q&A"}</span>
        <span className="pill" style={{ marginLeft: "auto", fontSize: "10px" }}>
          Bravo Ai
        </span>
      </div>
      <div className="qa-messages" ref={listRef}>
        {messages.map((m) => (
          <div className={`msg${m.role === "user" ? " user" : ""}`} key={m.id}>
            <div className={`msg-avatar ${m.role === "ai" ? "ai" : "user"}`}>{m.role === "ai" ? "Ω" : "U"}</div>
            {m.text === "…" ? (
              <div className="msg-bubble">
                <span className="spinner" /> Analysing…
              </div>
            ) : (
              <div className={`msg-bubble${m.error ? " error-msg" : ""}`}>
                {m.error ? "⚠ " : ""}
                {m.text}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="qa-input-row">
        <input
          className="qa-input"
          placeholder={variant === "dashboard" ? 'e.g. "What changed in FCA rules this month?"' : "Ask about any regulation…"}
          value={input}
          disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !busy) ask();
          }}
        />
        <button type="button" className="btn btn-primary" disabled={busy} onClick={ask}>
          {busy ? "…" : "Ask ↗"}
        </button>
      </div>
    </div>
  );
}
