const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
    "Content-Type": "application/json",
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const handleResponse = async (res) => {
    const data = await res.json();
    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/panel";
    }
    return data;
};

// Public
export const fetchMenu = () =>
    fetch(`${API_BASE}/api/get_menu`).then((r) => r.json());

export const fetchKategori = () =>
    fetch(`${API_BASE}/api/tabel_kategori`).then((r) => r.json());

export const getMeja = () =>
    fetch(`${API_BASE}/api/konfigurasi/get_kursi`).then((r) => r.json());

export const postOrder = (payload) =>
    fetch(`${API_BASE}/api/order_history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    }).then((r) => r.json());

// Auth
export const loginKaryawan = (username_login, password_login) =>
    fetch(`${API_BASE}/api/akun_karyawan/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username_login, password_login }),
    }).then((r) => r.json());

export const loginAdmin = (username, password) =>
    fetch(`${API_BASE}/api/akun_karyawan/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    }).then((r) => r.json());

// Protected — menu
export const createMenu = (data) =>
    fetch(`${API_BASE}/api/get_menu`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const updateMenu = (id, data) =>
    fetch(`${API_BASE}/api/get_menu/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const deleteMenu = (id) =>
    fetch(`${API_BASE}/api/get_menu/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    }).then(handleResponse);

// Protected — kategori
export const createKategori = (data) =>
    fetch(`${API_BASE}/api/tabel_kategori`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const updateKategori = (id, data) =>
    fetch(`${API_BASE}/api/tabel_kategori/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const deleteKategori = (id) =>
    fetch(`${API_BASE}/api/tabel_kategori/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    }).then(handleResponse);

// Protected — order history
export const fetchOrderHistory = () =>
    fetch(`${API_BASE}/api/order_history`, {
        headers: authHeaders(),
    }).then(handleResponse);

export const updateOrderStatus = (id, status) =>
    fetch(`${API_BASE}/api/order_history/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status }),
    }).then(handleResponse);

// Protected — konfigurasi
export const fetchKonfigurasi = () =>
    fetch(`${API_BASE}/api/konfigurasi`, {
        headers: authHeaders(),
    }).then(handleResponse);

export const updateKonfigurasi = (nama, value) =>
    fetch(`${API_BASE}/api/konfigurasi/${nama}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ value }),
    }).then(handleResponse);

// Protected — upload
export const uploadGambar = (formData) =>
    fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
    }).then(handleResponse);

// Protected — akun karyawan (admin)
export const fetchKaryawan = () =>
    fetch(`${API_BASE}/api/akun_karyawan`, {
        headers: authHeaders(),
    }).then(handleResponse);

export const createKaryawan = (data) =>
    fetch(`${API_BASE}/api/akun_karyawan`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const updateKaryawan = (id, data) =>
    fetch(`${API_BASE}/api/akun_karyawan/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const deleteKaryawan = (id) =>
    fetch(`${API_BASE}/api/akun_karyawan/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    }).then(handleResponse);
