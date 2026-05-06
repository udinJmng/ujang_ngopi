import { useState, useEffect, useRef, useCallback } from "react";
import "./styles/panel.css";

const API_BASE = "http://localhost:3000";

const emptyMenu = { nama_item: "", label_item: "", gambar_item: "", price: "", disc_perc: "", id_kategori: "", desc_item: "" };
const emptyKat = { nama_kategori: "" };

const resolveImg = (val) => {
    if (!val) return "";
    if (val.startsWith("http")) return val;
    if (val.startsWith("/uploads/")) return `${API_BASE}${val}`;
    return `${API_BASE}/uploads/${val}`;
};

export default function KaryawanDashboard({ user, onLogout, theme, toggleTheme }) {
    const [page, setPage] = useState("menu");
    const [menu, setMenu] = useState([]);
    const [kategori, setKategori] = useState([]);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imgPreview, setImgPreview] = useState("");
    const [toast, setToast] = useState({ msg: "", show: false });
    const fileInputRef = useRef(null);

    const showToast = useCallback((msg) => {
        setToast({ msg, show: true });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
    }, []);

    const fetchMenu = useCallback(() => {
        fetch(`${API_BASE}/api/get_menu`)
            .then((r) => r.json()).then(setMenu)
            .catch(() => showToast("Gagal memuat menu"));
    }, [showToast]);

    const fetchKategori = useCallback(() => {
        fetch(`${API_BASE}/api/tabel_kategori`)
            .then((r) => r.json()).then(setKategori)
            .catch(() => showToast("Gagal memuat kategori"));
    }, [showToast]);

    useEffect(() => { fetchMenu(); fetchKategori(); }, [fetchMenu, fetchKategori]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("gambar", file);
        try {
            const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: formData });
            const json = await res.json();
            if (!res.ok) { showToast(json.message || "Upload gagal"); return; }
            setImgPreview(`${API_BASE}${json.url}`);
            setModal((m) => ({ ...m, data: { ...m.data, gambar_item: json.url } }));
            showToast("Gambar berhasil diupload");
        } catch {
            showToast("Gagal upload gambar");
        } finally {
            setUploading(false);
        }
    };

    const saveMenu = async () => {
        setSaving(true);
        const { data, mode } = modal;
        const url = mode === "edit" ? `${API_BASE}/api/get_menu/${data.id_menu}` : `${API_BASE}/api/get_menu`;
        try {
            const res = await fetch(url, {
                method: mode === "edit" ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (!res.ok) { showToast(json.message || "Gagal menyimpan"); return; }
            showToast(mode === "edit" ? "Menu diperbarui" : "Menu ditambahkan");
            setModal(null);
            fetchMenu();
        } catch {
            showToast("Tidak bisa terhubung ke server");
        } finally {
            setSaving(false);
        }
    };

    const deleteMenu = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/get_menu/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) { showToast(json.message); return; }
            showToast("Menu dihapus");
            fetchMenu();
        } catch {
            showToast("Gagal menghapus");
        } finally {
            setConfirm(null);
        }
    };

    const saveKategori = async () => {
        setSaving(true);
        const { data, mode } = modal;
        const url = mode === "edit" ? `${API_BASE}/api/tabel_kategori/${data.id_kategori}` : `${API_BASE}/api/tabel_kategori`;
        try {
            const res = await fetch(url, {
                method: mode === "edit" ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (!res.ok) { showToast(json.message || "Gagal menyimpan"); return; }
            showToast(mode === "edit" ? "Kategori diperbarui" : "Kategori ditambahkan");
            setModal(null);
            fetchKategori();
            fetchMenu();
        } catch {
            showToast("Tidak bisa terhubung ke server");
        } finally {
            setSaving(false);
        }
    };

    const deleteKategori = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/tabel_kategori/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) { showToast(json.message); return; }
            showToast("Kategori dihapus");
            fetchKategori();
            fetchMenu();
        } catch {
            showToast("Gagal menghapus");
        } finally {
            setConfirm(null);
        }
    };

    const rp = (n) => "Rp" + Number(n).toLocaleString("id-ID");

    const filteredMenu = menu.filter((m) =>
        m.label_item?.toLowerCase().includes(search.toLowerCase()) ||
        m.nama_item?.toLowerCase().includes(search.toLowerCase())
    );
    const filteredKat = kategori.filter((k) =>
        k.nama_kategori?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="kd-root">
            <aside className="kd-sidebar">
                <div className="kd-sidebar-logo">Ujang <span>Ngopi</span></div>
                <div className="kd-sidebar-user">Halo, {user.fName}</div>

                <button
                    className={`kd-nav-item${page === "menu" ? " active" : ""}`}
                    onClick={() => { setPage("menu"); setSearch(""); }}
                >
                    Menu
                </button>
                <button
                    className={`kd-nav-item${page === "kategori" ? " active" : ""}`}
                    onClick={() => { setPage("kategori"); setSearch(""); }}
                >
                    Kategori
                </button>

                <div className="sidebar-bottom">
                    <button className="sidebar-theme-btn" onClick={toggleTheme}>
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>
                    <button className="kd-logout" onClick={onLogout}>
                        Keluar
                    </button>
                </div>
            </aside>

            <main className="kd-main">
                {page === "menu" && (
                    <>
                        <div className="kd-page-title">Kelola <span>Menu</span></div>
                        <div className="kd-page-sub">Tambah, ubah, atau hapus item yang tersedia</div>
                        <div className="kd-toolbar">
                            <input
                                className="kd-search"
                                placeholder="Cari menu..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button
                                className="kd-add-btn"
                                onClick={() => { setImgPreview(""); setModal({ type: "menu", mode: "add", data: { ...emptyMenu } }); }}
                            >
                                + Tambah Menu
                            </button>
                        </div>
                        <div className="kd-table-wrap">
                            <table className="kd-table">
                                <thead>
                                    <tr>
                                        <th>Nama</th>
                                        <th>Label</th>
                                        <th>Kategori</th>
                                        <th>Harga</th>
                                        <th>Diskon</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMenu.length === 0 ? (
                                        <tr><td colSpan={6} className="kd-empty">Tidak ada menu ditemukan</td></tr>
                                    ) : filteredMenu.map((item) => (
                                        <tr key={item.id_menu}>
                                            <td>{item.nama_item}</td>
                                            <td>{item.label_item}</td>
                                            <td><span className="kd-badge">{item.nama_kategori || "-"}</span></td>
                                            <td className="kd-price">{rp(item.price)}</td>
                                            <td className="kd-disc">{item.disc_perc > 0 ? `-${item.disc_perc}%` : "-"}</td>
                                            <td>
                                                <div className="kd-actions">
                                                    <button
                                                        className="kd-btn-edit"
                                                        onClick={() => { setImgPreview(resolveImg(item.gambar_item)); setModal({ type: "menu", mode: "edit", data: { ...item } }); }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="kd-btn-del"
                                                        onClick={() => setConfirm({ type: "menu", id: item.id_menu, name: item.label_item })}
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {page === "kategori" && (
                    <>
                        <div className="kd-page-title">Kelola <span>Kategori</span></div>
                        <div className="kd-page-sub">Atur pengelompokan item menu</div>
                        <div className="kd-toolbar">
                            <input
                                className="kd-search"
                                placeholder="Cari kategori..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button
                                className="kd-add-btn"
                                onClick={() => setModal({ type: "kat", mode: "add", data: { ...emptyKat } })}
                            >
                                + Tambah Kategori
                            </button>
                        </div>
                        <div className="kd-table-wrap">
                            <table className="kd-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nama Kategori</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredKat.length === 0 ? (
                                        <tr><td colSpan={3} className="kd-empty">Tidak ada kategori ditemukan</td></tr>
                                    ) : filteredKat.map((k) => (
                                        <tr key={k.id_kategori}>
                                            <td style={{ color: "var(--text-muted)" }}>{k.id_kategori}</td>
                                            <td>{k.nama_kategori}</td>
                                            <td>
                                                <div className="kd-actions">
                                                    <button
                                                        className="kd-btn-edit"
                                                        onClick={() => setModal({ type: "kat", mode: "edit", data: { ...k } })}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="kd-btn-del"
                                                        onClick={() => setConfirm({ type: "kat", id: k.id_kategori, name: k.nama_kategori })}
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>

            {modal?.type === "menu" && (
                <div className="kd-modal-wrap" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
                    <div className="kd-modal">
                        <div className="kd-modal-title">
                            {modal.mode === "add" ? "Tambah Menu Baru" : "Edit Menu"}
                        </div>

                        {[
                            { key: "nama_item", label: "Nama Item (slug)", placeholder: "kopi_susu" },
                            { key: "label_item", label: "Nama Tampil", placeholder: "Kopi Susu" },
                            { key: "price", label: "Harga (Rp)", placeholder: "15000", type: "number" },
                            { key: "disc_perc", label: "Diskon (%)", placeholder: "0", type: "number" },
                        ].map(({ key, label, placeholder, type }) => (
                            <div className="kd-field" key={key}>
                                <label className="kd-label">{label}</label>
                                <input
                                    className="kd-input"
                                    type={type || "text"}
                                    placeholder={placeholder}
                                    value={modal.data[key]}
                                    onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, [key]: e.target.value } }))}
                                />
                            </div>
                        ))}

                        <div className="kd-field">
                            <label className="kd-label">Deskripsi</label>
                            <textarea
                                className="kd-input"
                                placeholder="Ceritain dikit soal menu ini..."
                                rows={3}
                                style={{ resize: "vertical", lineHeight: 1.6 }}
                                value={modal.data.desc_item}
                                onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, desc_item: e.target.value } }))}
                            />
                        </div>

                        <div className="kd-field">
                            <label className="kd-label">Foto Menu</label>
                            <div
                                className={`kd-img-upload-area${imgPreview ? " has-preview" : ""}`}
                                onClick={() => !uploading && fileInputRef.current?.click()}
                            >
                                {uploading ? (
                                    <div className="kd-img-uploading">Mengupload...</div>
                                ) : imgPreview ? (
                                    <>
                                        <img src={imgPreview} alt="preview" className="kd-img-preview" />
                                        <div className="kd-img-preview-overlay">Klik untuk ganti foto</div>
                                    </>
                                ) : (
                                    <div className="kd-img-placeholder">
                                        Klik untuk upload foto<br />
                                        <small style={{ fontSize: 11, marginTop: 4, display: "block", color: "var(--text-muted)" }}>
                                            JPG, PNG, WEBP · Maks 5MB
                                        </small>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="kd-file-input"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="kd-field">
                            <label className="kd-label">Kategori</label>
                            <select
                                className="kd-input"
                                value={modal.data.id_kategori}
                                onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, id_kategori: e.target.value } }))}
                            >
                                <option value="">Pilih kategori</option>
                                {kategori.map((k) => (
                                    <option key={k.id_kategori} value={k.id_kategori}>{k.nama_kategori}</option>
                                ))}
                            </select>
                        </div>

                        <div className="kd-modal-footer">
                            <button className="kd-btn-cancel" onClick={() => setModal(null)}>Batal</button>
                            <button className="kd-btn-save" onClick={saveMenu} disabled={saving}>
                                {saving ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modal?.type === "kat" && (
                <div className="kd-modal-wrap" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
                    <div className="kd-modal">
                        <div className="kd-modal-title">
                            {modal.mode === "add" ? "Tambah Kategori" : "Edit Kategori"}
                        </div>
                        <div className="kd-field">
                            <label className="kd-label">Nama Kategori</label>
                            <input
                                className="kd-input"
                                type="text"
                                placeholder="Minuman"
                                value={modal.data.nama_kategori}
                                onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, nama_kategori: e.target.value } }))}
                            />
                        </div>
                        <div className="kd-modal-footer">
                            <button className="kd-btn-cancel" onClick={() => setModal(null)}>Batal</button>
                            <button className="kd-btn-save" onClick={saveKategori} disabled={saving}>
                                {saving ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirm && (
                <div className="kd-confirm-wrap">
                    <div className="kd-confirm">
                        <div className="kd-confirm-title">
                            Hapus {confirm.type === "menu" ? "menu" : "kategori"} ini?
                        </div>
                        <div className="kd-confirm-msg">
                            <strong>{confirm.name}</strong> akan dihapus permanen.
                        </div>
                        <div className="kd-confirm-btns">
                            <button className="kd-btn-cancel" onClick={() => setConfirm(null)}>Batal</button>
                            <button
                                className="kd-btn-danger"
                                onClick={() => confirm.type === "menu" ? deleteMenu(confirm.id) : deleteKategori(confirm.id)}
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`kd-toast${toast.show ? " show" : ""}`}>{toast.msg}</div>
        </div>
    );
}
