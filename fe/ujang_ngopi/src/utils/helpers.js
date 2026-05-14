const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

export const rp = (n) => "Rp" + Number(n).toLocaleString("id-ID");

export const fp = (item) =>
  item.disc_perc ? Math.round(item.price * (1 - item.disc_perc / 100)) : Number(item.price);

export const imgUrl = (val) => {
  if (!val) return "";
  if (val.startsWith("http://") || val.startsWith("https://")) return val;
  if (val.startsWith("/uploads/")) return `${API_BASE}${val}`;
  return `${API_BASE}/uploads/${val}`;
};
