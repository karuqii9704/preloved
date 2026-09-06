// Knowledge base untuk asisten CS — bersumber dari katalog live
// (lib/catalog.ts) dan halaman syarat titip-jual. Katalog diubah di sana,
// jawaban asisten otomatis mengikuti. Single source of truth.
import { products } from "../catalog";
import type { Product } from "../types";

export const STORE = {
  name: "preloved.",
  waNumber: "6285123071588", // sinkron dengan store_settings saat sudah konek Supabase
  greeting:
    "Halo! Aku *Prelo*, asisten virtual di sini 🌿\nTanya barang, kondisi, harga, atau mau titip jual? Tinggal ketik ya.",
};

export const CONDITION_LABELS: Record<Product["condition"], string> = {
  like_new: "Like New",
  very_good: "Sangat Baik",
  good: "Baik",
  fair: "Layak",
};

export type CatalogItem = Product & {
  effectivePrice: number;
  conditionLabel: string;
};

export const CATALOG: CatalogItem[] = products.map((p) => ({
  ...p,
  effectivePrice: p.promoPrice ?? p.price,
  conditionLabel: CONDITION_LABELS[p.condition],
}));

export const TITIP_JUAL = {
  formUrl: "/titip-jual",
  syaratUrl: "/syarat-titip-jual",
  summary:
    "Barang dikurasi dulu berdasarkan kondisi & kecocokan koleksi. Harga jual ditentukan setelah kurasi — nominal yang kamu isi adalah uang bersih yang kamu terima setelah barang terjual.",
  steps:
    "Caranya gampang kak:\n1. Isi form di halaman /titip-jual (detail barang, kondisi, harga bersih yang kamu mau)\n2. Unggah 1–6 foto asli barang\n3. Tim kami kurasi & hubungi kamu lewat WhatsApp\n4. Setelah jual, pembayaran dikirim ke kamu 🙂",
};
