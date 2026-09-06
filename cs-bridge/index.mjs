// cs-bridge — jembatan WhatsApp <-> AI CS storefront preloved.
// Jalankan persisten:  npm start  (di folder ini)
// Sesi WA tersimpan di .wwebjs_auth setelah scan QR pertama.
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const API_URL = process.env.CS_API_URL ?? "http://localhost:3000/api/cs-chat";
const BOT_NUMBER = "6285156739249"; // nomor cadangan yang dipasangi bot
const OWNER_NUMBER = "6285123071588@c.us"; // nomor toko (admin manusia)
const TAKEOVER_MINUTES = 30; // bot diam selama ini sejak admin ikut campur
const IGNORE_GROUPS = true;

// state takeover per pengirim: Set nomor yang lagi ditangani admin
const humanHandled = new Map(); // chatId -> timestamp mulai takeover

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./.wwebjs_auth" }),
  puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] },
});

client.on("qr", (qr) => {
  console.log("\n=== SCAN QR INI DENGAN NOMOR BOT (" + BOT_NUMBER + ") ===");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ Bot siap sebagai", (client.info?.wid?._serialized ?? "?"));
  console.log("   API:", API_URL);
  console.log("   Takeover admin → bot diam", TAKEOVER_MINUTES, "menit per kontak.");
});

client.on("auth_failure", (m) => console.error("❌ Auth gagal:", m));

function isHumanActive(chatId) {
  const until = humanHandled.get(chatId);
  if (!until) return false;
  if (Date.now() > until) {
    humanHandled.delete(chatId);
    return false;
  }
  return true;
}

async function askAI(text, senderName) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, senderName }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // site mati / dev server mati → bot diam saja
  }
}

client.on("message", async (msg) => {
  try {
    if (IGNORE_GROUPS && (await msg.getChat()).isGroup) return;
    if (msg.fromMe) return;

    const contact = await msg.getContact();
    const name = contact.pushname ?? contact.number;
    const text = (msg.body ?? "").trim();
    if (!text) return;

    // 1) Perintah owner (dari nomor toko): /ambil <nomor> → bot diam 30 menit
    if (msg.from === OWNER_NUMBER) {
      const m = text.match(/^\/ambil\s+(\d{8,15})$/);
      if (m) {
        humanHandled.set(`${m[1]}@c.us`, Date.now() + TAKEOVER_MINUTES * 60_000);
        await msg.reply(`✅ Bot diam ${TAKEOVER_MINUTES} menit untuk +${m[1]}. Silakan layani manual.`);
      }
      return;
    }

    // 2) Pelanggan minta admin / komplain → teruskan konteks ke owner, bot diam
    const lower = text.toLowerCase();
    const wantsHuman = /\b(admin|cs|manusia|orang asli|owner)\b/.test(lower);
    const isComplaint = ["rusak", "kecewa", "penipu", "komplain", "refund"].some((w) => lower.includes(w));
    if (wantsHuman || isComplaint || isHumanActive(msg.from)) {
      if (!isHumanActive(msg.from)) {
        humanHandled.set(msg.from, Date.now() + TAKEOVER_MINUTES * 60_000);
        await client.sendMessage(
          OWNER_NUMBER,
          `🔔 *Butuh admin* (${wantsHuman ? "minta admin" : "komplain"})\nDari: ${name} (+${msg.from.split("@")[0]})\nPesan: "${text}"\n\nBalas langsung di chat ini atau ketik /ambil ${msg.from.split("@")[0]} untuk mematikan bot 30 menit.`
        );
        await msg.reply(
          "Baik kak, aku teruskan ke admin manusia ya 🙏\nMohon tunggu sebentar — kakak bisa juga lanjut chat di sini, admin akan membalas."
        );
      }
      return; // bot tidak menjawab isi selanjutnya selama takeover
    }

    // 3) Rutin → tanya engine AI
    const ai = await askAI(text, name);
    if (!ai) return; // API down → diam, jangan spam error ke pelanggan

    if (ai.handoff && ai.handoffUrl) {
      // engine menyarankan eskalasi dengan link WA berkonteks (mode widget).
      // Di bridge asli, cukup teruskan ke owner + konfirmasi ke pelanggan.
      await client.sendMessage(
        OWNER_NUMBER,
        `🔔 ${ai.reason ?? "Butuh admin"}\nDari: ${name} (+${msg.from.split("@")[0]})\n${text}`
      );
      await msg.reply(ai.intro ?? "Aku teruskan ke admin ya kak 🙏");
      humanHandled.set(msg.from, Date.now() + TAKEOVER_MINUTES * 60_000);
      return;
    }

    if (ai.reply) await msg.reply(ai.reply);
  } catch (err) {
    console.error("handler error:", err?.message ?? err);
  }
});

client.initialize();
