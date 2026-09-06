"use client";
// Widget asisten CS "Prelo" — melayang kanan-bawah, stateless, tanpa dependensi.
import { useEffect, useRef, useState } from "react";

type Msg = { sender: "customer" | "ai" | "system"; text: string; handoffUrl?: string };

const QUICK_TOPICS = [
  { label: "🌿 Titip jual", text: "mau titip jual barang, caranya gimana?" },
  { label: "📦 Cek barang", text: "tas kulit klasik masih ada?" },
  { label: "🏷️ Lihat harga", text: "harga cardigan rajut biru berapa?" },
  { label: "🚚 Ongkir & bayar", text: "ongkir dan cara bayarnya gimana?" },
];

export function CsWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  async function send(raw?: string) {
    const text = (raw ?? input).trim();
    if (!text || busy) return;
    setInput("");
    const history = msgs
      .filter((m) => m.sender === "customer")
      .map((m) => ({ sender: "customer" as const, text: m.text }));
    setMsgs((m) => [...m, { sender: "customer", text }]);
    setBusy(true);
    try {
      const res = await fetch("/api/cs-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, history }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) {
        setMsgs((m) => [...m, { sender: "system", text: data.error ?? "Coba lagi ya." }]);
      } else {
        setMsgs((m) => [...m, { sender: "ai", text: data.reply }]);
      }
      if (data.handoff && data.intro && data.handoffUrl) {
        setMsgs((m) => [...m, { sender: "system", text: data.intro, handoffUrl: data.handoffUrl }]);
      }
    } catch {
      setMsgs((m) => [...m, { sender: "system", text: "⚠️ Koneksi bermasalah. Coba lagi ya." }]);
    }
    setBusy(false);
  }

  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 40 }}>
      {open ? (
        <div
          role="dialog"
          aria-label="Asisten CS Prelo"
          style={{
            width: "min(92vw, 370px)",
            height: "min(70vh, 540px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 20,
            border: "1px solid var(--line)",
            background: "#fffdf9",
            boxShadow: "0 24px 60px rgba(38,54,74,.28)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              background: "var(--pink-strong)",
              color: "white",
            }}
          >
            <div
              aria-hidden
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "var(--pink-deep)",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
              }}
            >
              P
            </div>
            <div style={{ flex: 1, lineHeight: 1.2 }}>
              <strong>Prelo</strong>
              <div style={{ fontSize: 11.5, opacity: 0.9 }}>Asisten virtual · online 🌿</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Tutup chat"
              style={{ border: 0, background: "transparent", color: "white", fontSize: 22, lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          {/* Chat */}
          <div ref={endRef} className="chat-scroll" style={{ flex: 1, overflowY: "auto", padding: 12, display: "grid", gap: 8, alignContent: "start" }}>
            {!msgs.length && (
              <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, margin: "18px 6px" }}>
                Halo! 👋 Aku Prelo. Tanya barang, kondisi, harga, atau mau titip jual?
              </p>
            )}
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.sender === "customer" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "86%",
                    padding: "8px 12px",
                    borderRadius: 14,
                    borderBottomRightRadius: m.sender === "customer" ? 4 : undefined,
                    borderBottomLeftRadius: m.sender !== "customer" ? 4 : undefined,
                    background:
                      m.sender === "customer" ? "var(--pink-strong)" : m.sender === "system" ? "var(--peach)" : "white",
                    color: m.sender === "customer" ? "white" : "var(--ink)",
                    border: m.sender === "ai" ? "1px solid var(--line)" : undefined,
                    fontSize: 13.5,
                    whiteSpace: "pre-line",
                  }}
                >
                  {m.text}
                  {m.handoffUrl && (
                    <a href={m.handoffUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ marginTop: 10, minHeight: 38 }}>
                      Lanjut ke WhatsApp admin →
                    </a>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>Prelo sedang mengetik…</div>
            )}
          </div>

          {/* Quick topics */}
          {!msgs.length && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "0 12px 10px" }}>
              {QUICK_TOPICS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => send(t.text)}
                  style={{
                    border: "1px solid var(--line)",
                    background: "var(--pink-soft)",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "6px 10px",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid var(--line)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pertanyaan…"
              maxLength={600}
              aria-label="Pesan untuk Prelo"
              style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 999, padding: "10px 14px", background: "white" }}
            />
            <button type="submit" className="btn" disabled={busy || !input.trim()} style={{ minWidth: 46, padding: "0 14px" }} aria-label="Kirim">
              ➤
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Buka asisten CS Prelo"
          className="btn"
          style={{ borderRadius: "999px", boxShadow: "0 12px 28px rgba(38,54,74,.25)" }}
        >
          💬 Tanya Prelo
        </button>
      )}
    </div>
  );
}
