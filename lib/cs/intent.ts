// Rule-based intent router domain preloved (Bahasa Indonesia informal).
// Semua intent rutin selesai tanpa LLM (<50ms, gratis).
import { CATALOG } from "./kb";

const normalize = (t: string) =>
  t.toLowerCase().replace(/brp|brapa|brpa/g, "berapa").replace(/yg|yng/g, "yang")
    .replace(/gmn|gmna/g, "gimana").replace(/udh|dh|dah/g, "sudah").replace(/blm/g, "belum")
    .replace(/\btj\b/g, "titip jual").replace(/[!?]+$/g, "").replace(/\s+/g, " ").trim();

const has = (t: string, ws: string[]) => ws.some((w) => t.includes(w));

export const INTENTS = [
  "COMPLAINT", "ASK_HUMAN", "TITIP_JUAL", "ORDER_HELP", "SHIPPING_PAY",
  "AVAILABILITY", "CONDITION_Q", "PRICE_QUERY", "GREETING",
] as const;

export type Detected = { intent: (typeof INTENTS)[number]; confidence: number; normalized: string };

const COMPLAINT = ["rusak", "pecah", "salah kirim", "tidak sesuai", "ga sesuai", "gak sesuai", "kecewa", "refund", "uang kembali", "penipu", "parah", "komplain"];
const ASK_HUMAN_RE = /\b(admin|cs|customer service|manusia|orang asli|owner)\b/i;
const TITIP = ["titip jual", "titipjual", "consignment", "njualin", "dijualanin", "mau jual barang", "jualin barang", "consign"];
const ORDER = ["pesanan", "order", "checkout", "cara beli", "mau beli", "pesan gimana"];
const SHIP_PAY = ["ongkir", "kirim", "pengiriman", "ekspedisi", "cod", "bayar", "transfer", "payment", "qris", "rekber"];
const AVAILABLE = ["masih ada", "ready", "stok", "stock", "tersedia", "available", "ada ga", "ada gak", "kosong", "sold"];
const CONDITION = ["kondisi", "mulus", "cacat", "noda", "sobek", "kekurangan", "minus", "grade"];
const PRICE = ["harga", "berapa", "promo", "diskon", "murah", "nego", "discount"];
const GREETINGS = ["halo", "hai", "hello", "selamat pagi", "selamat siang", "selamat sore", "selamat malam", "assalamualaikum"];

export function detectIntent(raw: string): Detected | null {
  const t = normalize(raw);
  if (has(t, COMPLAINT)) return { intent: "COMPLAINT", confidence: 0.97, normalized: t };
  if (ASK_HUMAN_RE.test(t)) return { intent: "ASK_HUMAN", confidence: 0.95, normalized: t };
  if (has(t, TITIP)) return { intent: "TITIP_JUAL", confidence: 0.94, normalized: t };
  if (has(t, ["resi", "tracking"]) || (has(t, ORDER) && has(t, ["status", "sampai", "dikirim"])))
    return { intent: "ORDER_HELP", confidence: 0.88, normalized: t };
  if (has(t, SHIP_PAY)) return { intent: "SHIPPING_PAY", confidence: 0.87, normalized: t };
  if (has(t, AVAILABLE)) return { intent: "AVAILABILITY", confidence: 0.9, normalized: t };
  if (has(t, CONDITION)) return { intent: "CONDITION_Q", confidence: 0.88, normalized: t };
  if (has(t, PRICE)) return { intent: "PRICE_QUERY", confidence: 0.88, normalized: t };
  if (GREETINGS.some((g) => t === g || t.startsWith(g + " ")) && t.length < 30)
    return { intent: "GREETING", confidence: 0.92, normalized: t };
  return null; // → fallback path
}

/** Cocokkan penyebutan produk: nama, kode (plv-0002), atau kategori. */
export type ProductMatch = (typeof CATALOG_INDEX)[number];

export function matchProduct(raw: string): ProductMatch | null {
  const t = normalize(raw);
  let best: ProductMatch | null = null;
  let bestScore = 0;
  for (const p of CATALOG_INDEX) {
    let score = 0;
    for (const kw of p.keywords) if (t.includes(kw)) score += kw.length;
    if (score > bestScore) { bestScore = score; best = p; }
  }
  return best;
}

// Index kata kunci per produk dari nama, kode, slug, dan kategori.
const CATALOG_INDEX = CATALOG.map((p) => ({
  ...p,
  keywords: [
    p.code.toLowerCase(),
    p.category.toLowerCase(),
    p.slug.replace(/-/g, " "),
    ...p.name.toLowerCase().split(" ").filter((w) => w.length > 3),
  ],
}));
