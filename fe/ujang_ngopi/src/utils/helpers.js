const API_BASE = "http://localhost:3000";

// Format angka ke Rupiah
export const rp = (n) => "Rp" + Number(n).toLocaleString("id-ID");

// Hitung harga setelah diskon
export const fp = (item) =>
  item.disc_perc ? Math.round(item.price * (1 - item.disc_perc / 100)) : Number(item.price);

// Resolve gambar_item ke URL yang bisa dipakai sebagai src
// Handles: "/uploads/xxx.jpg", "kopix.png", "https://...", ""
export const imgUrl = (val) => {
  if (!val) return "";
  if (val.startsWith("http://") || val.startsWith("https://")) return val;
  if (val.startsWith("/uploads/")) return `${API_BASE}${val}`;
  // legacy: nama file doang tanpa path
  return `${API_BASE}/uploads/${val}`;
};
