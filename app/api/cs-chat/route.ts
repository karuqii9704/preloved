// Endpoint asisten CS. Stateless — klien mengirim riwayat singkat saat
// perlu eskalasi, server tidak menyimpan apa pun (konsisten pola repo ini).
import { NextResponse } from "next/server";
import { detectIntent } from "@/lib/cs/intent";
import { buildAnswer } from "@/lib/cs/engine";
import { buildHandoffLink } from "@/lib/cs";

export const runtime = "nodejs";

type ChatBody = { text?: string; history?: { sender: string; text: string }[] };

export async function POST(request: Request) {
  const startedAt = Date.now();
  let body: ChatBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON" }, { status: 400 });
  }

  const text = (body?.text ?? "").trim();
  if (!text || text.length > 600) {
    return NextResponse.json({ error: "Pesan kosong atau terlalu panjang." }, { status: 400 });
  }

  // 1) Eskalasi dulu: komplain & permintaan manusia tidak disentuh AI jawaban
  const detected = detectIntent(text);
  if (detected && (detected.intent === "COMPLAINT" || detected.intent === "ASK_HUMAN")) {
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    const reason =
      detected.intent === "COMPLAINT" ? "komplain pelanggan" : "minta bicara dengan admin";
    const intro =
      detected.intent === "COMPLAINT"
        ? "Waduh, mohon maaf banget pengalamannya nggak menyenangkan 🙏\nAku hubungkan sekarang sama admin manusia ya — rangkuman percakapan kita udah aku siapkan otomatis di WhatsApp."
        : "Baik! Aku siapkan obrolan langsung sama admin manusia ya 🙋\nRangkuman chat kita otomatis ikut terkirim biar kamu nggak perlu ulang cerita.";
    return NextResponse.json({
      handoff: true,
      reason,
      intro,
      handoffUrl: buildHandoffLink([...history, { sender: "customer", text }], reason),
      intent: detected.intent,
      confidence: detected.confidence,
    });
  }

  // 2) Intent rutin → jawaban grounded dari katalog
  if (detected) {
    const answer = buildAnswer(detected, text);
    if (answer) {
      return NextResponse.json({
        reply: answer.reply,
        intent: detected.intent,
        confidence: answer.confidence,
        latencyMs: Date.now() - startedAt,
      });
    }
  }

  // 3) Fallback deterministik — tanpa API key pun tetap hidup
  return NextResponse.json({
    reply:
      'Hmm, yang itu belum bisa aku jawab pasti 🙏\nCoba ketik "harga", "titip jual", atau nama barangnya — atau ketik *admin* kalau mau langsung dibantu tim kami.',
    intent: "FALLBACK",
    confidence: 0.3,
  });
}
