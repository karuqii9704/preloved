// Engine CS: intent routing → grounded answers dari katalog.
// Semua angka (harga/status/kondisi) berasal dari lib/catalog.ts, tidak ada
// yang digenerate bebas. Eskalasi ditangani di API route via buildHandoffLink.
import { detectIntent, matchProduct, type Detected } from "./intent";
import { CATALOG, STORE, TITIP_JUAL, CONDITION_LABELS } from "./kb";
import { formatIDR } from "../catalog";

const rupiah = formatIDR;

function productLines(p: (typeof CATALOG)[number]): string[] {
  const statusText: Record<string, string> = {
    available: "Ready ✅",
    reserved: "Lagi *reserved* ya kak 🙏 (ada yang lagi proses beli)",
    sold: "Sayangnya udah *sold* 😢 Tapi boleh banget cek barang lain yang mirip!",
    draft: "Lagi diproses tim kami.",
    archived: "Udah nggak dijual lagi.",
  };
  const promo = p.promoPrice
    ? `~~${rupiah(p.price)}~~ *${rupiah(p.promoPrice)}* 🏷️`
    : rupiah(p.price);
  return [
    `*${p.name}* [${p.code}] — ${statusText[p.status] ?? p.status}`,
    `Kondisi: ${p.conditionLabel} · ${p.shortDescription}`,
    `Harga: ${promo}`,
    `Detail & foto: /products/${p.slug}`,
  ];
}

/** Bangun balasan grounded. Return null untuk intent eskalasi/tak dikenal. */
export function buildAnswer(
  detected: Pick<Detected, "intent" | "normalized">,
  raw: string
): { reply: string; confidence: number } | null {
  switch (detected.intent) {
    case "GREETING":
      return { reply: STORE.greeting, confidence: 0.95 };

    case "TITIP_JUAL":
      return {
        reply:
          `Boleh banget titip jual di ${STORE.name}! 🌿\n\n${TITIP_JUAL.steps}\n\n` +
          `Syarat lengkapnya: ${TITIP_JUAL.syaratUrl}\nLangsung isi form: ${TITIP_JUAL.formUrl}`,
        confidence: 0.95,
      };

    case "ORDER_HELP": {
      const lines = [
        "Untuk pesanan lewat website:\n1. Pilih barang → klik *Pesan via WhatsApp*\n2. Chat admin kebuka otomatis berisi nama, alamat, dan daftar pesananmu\n3. Admin balas dengan info ketersediaan, ongkir, dan pembayaran",
      ];
      const p = matchProduct(raw);
      if (p && p.status === "available")
        lines.push(`\nBtw, *${p.name}* [${p.code}] masih available kalau mau sekalian dipesan 😉`);
      return { reply: lines.join("\n"), confidence: 0.9 };
    }

    case "SHIPPING_PAY": {
      if (/cod/.test(detected.normalized)) {
        return {
          reply:
            "Untuk COD sebaiknya konfirmasi langsung ke admin ya kak, ketersediaannya tergantung lokasi 🙏\nKetik *admin* kalau mau aku sambungkan sekarang.",
          confidence: 0.85,
        };
      }
      return {
        reply:
          "Semua pemesanan ditindaklanjuti admin lewat WhatsApp:\n• Ongkir dihitung sesuai alamat & berat (dipastikan saat konfirmasi)\n• Pembayaran dikonfirmasi langsung oleh admin\n• Barang dikirim setelah pembayaran masuk 📦\n\nAda barang spesifik yang mau ditanyakan?",
        confidence: 0.88,
      };
    }

    case "AVAILABILITY": {
      const p = matchProduct(raw);
      if (!p) {
        const avail = CATALOG.filter((x) => x.status === "available");
        return {
          reply:
            "Boleh sebutkan barangnya kak? Yang tersedia saat ini:\n" +
            avail.map((x) => `• ${x.name} [${x.code}] — ${rupiah(x.effectivePrice)}`).join("\n"),
          confidence: 0.8,
        };
      }
      return { reply: productLines(p).join("\n"), confidence: 0.94 };
    }

    case "CONDITION_Q": {
      const p = matchProduct(raw);
      if (!p)
        return {
          reply:
            "Mau tanya kondisi barang yang mana kak? Grade kami:\n" +
            Object.values(CONDITION_LABELS).map((c) => `• ${c}`).join("\n") +
            "\nSetiap barang dicantumkan catatan kondisi jujur di halamannya.",
          confidence: 0.85,
        };
      return { reply: productLines(p).join("\n"), confidence: 0.93 };
    }

    case "PRICE_QUERY": {
      const p = matchProduct(raw);
      if (!p) {
        const list = CATALOG.filter((x) => x.status !== "sold").map(
          (x) =>
            `• ${x.name} [${x.code}] — ${
              x.promoPrice ? `~~${rupiah(x.price)}~~ *${rupiah(x.effectivePrice)}*` : rupiah(x.effectivePrice)
            }`
        );
        return {
          reply:
            "Harga-harga saat ini kak:\n" + list.join("\n") + "\n\nBarang preloved satu-satu, harga sudah final ya kak 🙏",
          confidence: 0.88,
        };
      }
      const statusLabel =
        p.status === "available" ? "masih ready" : p.status === "reserved" ? "lagi reserved" : "sudah sold";
      return {
        reply: `${p.name} [${p.code}] — ${
          p.promoPrice ? `~~${rupiah(p.price)}~~ *${rupiah(p.effectivePrice)}*` : rupiah(p.effectivePrice)
        }\nStatus: ${statusLabel}\nHarga preloved sudah fix ya kak (barangnya satu-satu) 🙂`,
        confidence: 0.92,
      };
    }

    case "COMPLAINT":
    case "ASK_HUMAN":
      return null; // ditangani sebagai eskalasi di API route
  }
}
