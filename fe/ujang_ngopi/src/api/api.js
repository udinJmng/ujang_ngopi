const API_BASE = "http://localhost:3000";

export const fetchMenu = () =>
  fetch(`${API_BASE}/api/get_menu`).then((r) => r.json());

export const getMeja = () =>
  fetch(`${API_BASE}/api/konfigurasi/get_kursi`).then((r) => r.json());

export const fetchKategori = () =>
  fetch(`${API_BASE}/api/tabel_kategori`).then((r) => r.json());

export const postOrder = (payload) =>
  fetch(`${API_BASE}/api/order_history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => r.json());
