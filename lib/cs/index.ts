export { detectIntent, matchProduct, type Detected } from "./intent";
export { buildAnswer } from "./engine";
export { STORE, TITIP_JUAL } from "./kb";

/** Deep-link WhatsApp dengan konteks transkrip — pola sama dengan checkout. */
export function buildHandoffLink(
  transcript: { sender: string; text: string }[],
  reason: string
): string {
  const ringkasan = transcript
    .slice(-6)
    .map((m) => `${m.sender === "customer" ? "Pelanggan" : "Prelo"}: ${m.text}`)
    .join("\n");
  const message =
    `Halo Admin preloved., saya butuh bantuan manusia 🙏\n` +
    `(Alasan: ${reason})\n\n--- Rangkuman chat dengan asisten AI ---\n${ringkasan}\n--------------------------------\n\nMohon dibantu ya kak!`;
  return `https://wa.me/6285123071588?text=${encodeURIComponent(message)}`;
}
