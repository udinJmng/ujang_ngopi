import { useState, useEffect, useRef, useCallback } from "react";
import "./styles/panel.css";
import {
    fetchMenu as apiFetchMenu, fetchKategori as apiFetchKategori,
    createMenu, updateMenu, deleteMenu as apiDeleteMenu,
    createKategori, updateKategori, deleteKategori as apiDeleteKategori,
    fetchOrderHistory, updateOrderStatus,
    fetchKonfigurasi, updateKonfigurasi,
    uploadGambar,
} from "./api/api";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

const emptyMenu = { nama_item: "", label_item: "", gambar_item: "", price: "", disc_perc: "", id_kategori: "", desc_item: "" };
const emptyKat = { nama_kategori: "" };

const resolveImg = (val) => {
    if (!val) return "";
    if (val.startsWith("http")) return val;
    if (val.startsWith("/uploads/")) return `${API_BASE}${val}`;
    return `${API_BASE}/uploads/${val}`;
};

const rp = (n) => "Rp" + Number(n).toLocaleString("id-ID");

const calcTotal = (order) => {
    if (order.total_pay) return Number(order.total_pay);
    try {
        const items = JSON.parse(order.data_order || "[]");
        const sub = items.reduce((a, b) => a + (Number(b.price) * Number(b.qty)), 0);
        return sub + Math.round(sub * 0.11) + Math.round(sub * 0.05);
    } catch { return 0; }
};

function KonfRow({ item, onSave }) {
    const [val, setVal] = useState(item.VALUE);
    const [saving, setSaving] = useState(false);
    return (
        <tr>
            <td>{item.nama_konfigurasi}</td>
            <td>
                <input className="kd-input" type="number" style={{ width: 80 }} value={val} min={1}
                    onChange={(e) => setVal(e.target.value)} />
            </td>
            <td>
                <button className="kd-btn-edit" disabled={saving}
                    onClick={async () => { setSaving(true); await onSave(item.nama_konfigurasi, Number(val)); setSaving(false); }}>
                    {saving ? "..." : "Simpan"}
                </button>
            </td>
        </tr>
    );
}

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
    const [orders, setOrders] = useState([]);
    const [konfigurasi, setKonfigurasi] = useState([]);
    const [detailOrder, setDetailOrder] = useState(null);
    const fileInputRef = useRef(null);

    const showToast = useCallback((msg) => {
        setToast({ msg, show: true });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
    }, []);

    const loadMenu = useCallback(() => {
        apiFetchMenu().then(setMenu).catch(() => showToast("Gagal memuat menu"));
    }, [showToast]);

    const loadKat = useCallback(() => {
        apiFetchKategori().then(setKategori).catch(() => showToast("Gagal memuat kategori"));
    }, [showToast]);

    const loadOrders = useCallback(() => {
        fetchOrderHistory().then(setOrders).catch(() => showToast("Gagal memuat histori"));
    }, [showToast]);

    const loadKonfigurasi = useCallback(() => {
        fetchKonfigurasi().then(setKonfigurasi).catch(() => showToast("Gagal memuat konfigurasi"));
    }, [showToast]);

    useEffect(() => { loadMenu(); loadKat(); }, [loadMenu, loadKat]);
    useEffect(() => {
        if (page === "histori") loadOrders();
        if (page === "konfigurasi") loadKonfigurasi();
    }, [page, loadOrders, loadKonfigurasi]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("gambar", file);
        try {
            const json = await uploadGambar(formData);
            if (json.url) {
                setImgPreview(`${API_BASE}${json.url}`);
                setModal((m) => ({ ...m, data: { ...m.data, gambar_item: json.url } }));
                showToast("Gambar berhasil diupload");
            } else {
                showToast(json.message || "Upload gagal");
            }
        } catch { showToast("Gagal upload gambar"); }
        finally { setUploading(false); }
    };

    const saveMenu = async () => {
        setSaving(true);
        const { data, mode } = modal;
        try {
            const json = mode === "edit" ? await updateMenu(data.id_menu, data) : await createMenu(data);
            if (json.error || json.message?.includes("gagal")) { showToast(json.message || "Gagal menyimpan"); return; }
            showToast(mode === "edit" ? "Menu diperbarui" : "Menu ditambahkan");
            setModal(null); loadMenu();
        } catch { showToast("Tidak bisa terhubung ke server"); }
        finally { setSaving(false); }
    };

    const handleDeleteMenu = async (id) => {
        try {
            await apiDeleteMenu(id);
            showToast("Menu dihapus"); loadMenu();
        } catch { showToast("Gagal menghapus"); }
        finally { setConfirm(null); }
    };

    const saveKategori = async () => {
        setSaving(true);
        const { data, mode } = modal;
        try {
            const json = mode === "edit" ? await updateKategori(data.id_kategori, data) : await createKategori(data);
            if (json.error) { showToast(json.message || "Gagal menyimpan"); return; }
            showToast(mode === "edit" ? "Kategori diperbarui" : "Kategori ditambahkan");
            setModal(null); loadKat(); loadMenu();
        } catch { showToast("Tidak bisa terhubung ke server"); }
        finally { setSaving(false); }
    };

    const handleDeleteKategori = async (id) => {
        try {
            await apiDeleteKategori(id);
            showToast("Kategori dihapus"); loadKat(); loadMenu();
        } catch { showToast("Gagal menghapus"); }
        finally { setConfirm(null); }
    };

    const filteredMenu = menu.filter((m) =>
        m.label_item?.toLowerCase().includes(search.toLowerCase()) ||
        m.nama_item?.toLowerCase().includes(search.toLowerCase())
    );
    const filteredKat = kategori.filter((k) =>
        k.nama_kategori?.toLowerCase().includes(search.toLowerCase())
    );
    const filteredOrders = orders
        .filter((o) =>
            (o.payment_refcode || "").toLowerCase().includes(search.toLowerCase()) ||
            (o.no_meja || "").toString().includes(search)
        )
        .sort((a, b) => b.id - a.id);

    const navTo = (p) => { setPage(p); setSearch(""); };

    return (
        <div className="kd-root">
            <aside className="kd-sidebar">
                <div className="kd-sidebar-logo">Ujang <span>Ngopi</span></div>
                <div className="kd-sidebar-user">Halo, {user.fName}</div>
                {[
                    { key: "menu", label: "Menu" },
                    { key: "kategori", label: "Kategori" },
                    { key: "histori", label: "Histori Pembayaran" },
                    { key: "konfigurasi", label: "Konfigurasi Meja" },
                ].map(({ key, label }) => (
                    <button key={key} className={`kd-nav-item${page === key ? " active" : ""}`} onClick={() => navTo(key)}>
                        {label}
                    </button>
                ))}
                <div className="sidebar-bottom">
                    <button className="sidebar-theme-btn" onClick={toggleTheme}>
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>
                    <button className="kd-logout" onClick={onLogout}>Keluar</button>
                </div>
            </aside>

            <main className="kd-main">
                {page === "menu" && (
                    <>
                        <div className="kd-page-title">Kelola <span>Menu</span></div>
                        <div className="kd-page-sub">Tambah, ubah, atau hapus item yang tersedia</div>
                        <div className="kd-toolbar">
                            <input className="kd-search" placeholder="Cari menu..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            <button className="kd-add-btn" onClick={() => { setImgPreview(""); setModal({ type: "menu", mode: "add", data: { ...emptyMenu } }); }}>
                                + Tambah Menu
                            </button>
                        </div>
                        <div className="kd-table-wrap">
                            <table className="kd-table">
                                <thead><tr><th>Nama</th><th>Label</th><th>Kategori</th><th>Harga</th><th>Diskon</th><th>Aksi</th></tr></thead>
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
                                                    <button className="kd-btn-edit" onClick={() => { setImgPreview(resolveImg(item.gambar_item)); setModal({ type: "menu", mode: "edit", data: { ...item } }); }}>Edit</button>
                                                    <button className="kd-btn-del" onClick={() => setConfirm({ type: "menu", id: item.id_menu, name: item.label_item })}>Hapus</button>
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
                            <input className="kd-search" placeholder="Cari kategori..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            <button className="kd-add-btn" onClick={() => setModal({ type: "kat", mode: "add", data: { ...emptyKat } })}>
                                + Tambah Kategori
                            </button>
                        </div>
                        <div className="kd-table-wrap">
                            <table className="kd-table">
                                <thead><tr><th>ID</th><th>Nama Kategori</th><th>Aksi</th></tr></thead>
                                <tbody>
                                    {filteredKat.length === 0 ? (
                                        <tr><td colSpan={3} className="kd-empty">Tidak ada kategori ditemukan</td></tr>
                                    ) : filteredKat.map((k) => (
                                        <tr key={k.id_kategori}>
                                            <td style={{ color: "var(--text-muted)" }}>{k.id_kategori}</td>
                                            <td>{k.nama_kategori}</td>
                                            <td>
                                                <div className="kd-actions">
                                                    <button className="kd-btn-edit" onClick={() => setModal({ type: "kat", mode: "edit", data: { ...k } })}>Edit</button>
                                                    <button className="kd-btn-del" onClick={() => setConfirm({ type: "kat", id: k.id_kategori, name: k.nama_kategori })}>Hapus</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {page === "histori" && (
                    <>
                        <div className="kd-page-title">Histori <span>Pembayaran</span></div>
                        <div className="kd-page-sub">Lihat dan konfirmasi status pembayaran pelanggan</div>
                        <div className="kd-toolbar">
                            <input className="kd-search" placeholder="Cari refcode atau meja..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            <button className="kd-add-btn" onClick={loadOrders}>Refresh</button>
                        </div>
                        <div className="kd-table-wrap">
                            <table className="kd-table">
                                <thead><tr><th>Refcode</th><th>Meja</th><th>Metode</th><th>Total</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr></thead>
                                <tbody>
                                    {filteredOrders.length === 0 ? (
                                        <tr><td colSpan={7} className="kd-empty">Belum ada histori pembayaran</td></tr>
                                    ) : filteredOrders.map((o) => (
                                        <tr key={o.id}>
                                            <td style={{ fontFamily: "monospace", fontSize: 12 }}>{o.payment_refcode || "-"}</td>
                                            <td>{o.no_meja ? `Meja ${o.no_meja}` : <span style={{ color: "var(--text-muted)" }}>-</span>}</td>
                                            <td><span className="kd-badge">{o.pay_via}</span></td>
                                            <td className="kd-price">{rp(calcTotal(o))}</td>
                                            <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{o.pay_at}</td>
                                            <td>
                                                <span style={{
                                                    display: "inline-block", padding: "2px 10px", borderRadius: 4,
                                                    fontSize: 11, fontWeight: 500,
                                                    background: o.status === "sukses" ? "rgba(39,174,96,0.1)" : "rgba(181,101,29,0.1)",
                                                    color: o.status === "sukses" ? "var(--green)" : "var(--amber)",
                                                }}>{o.status}</span>
                                            </td>
                                            <td>
                                                <div className="kd-actions">
                                                    <button className="kd-btn-edit" onClick={() => setDetailOrder(o)}>Detail</button>
                                                    {o.status === "proses" && (
                                                        <button className="kd-btn-edit"
                                                            style={{ background: "rgba(39,174,96,0.1)", borderColor: "rgba(39,174,96,0.3)", color: "var(--green)" }}
                                                            onClick={async () => {
                                                                try { await updateOrderStatus(o.id, "sukses"); showToast("Pembayaran dikonfirmasi"); loadOrders(); }
                                                                catch { showToast("Gagal update status"); }
                                                            }}>
                                                            Konfirmasi
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {page === "konfigurasi" && (
                    <>
                        <div className="kd-page-title">Konfigurasi <span>Meja</span></div>
                        <div className="kd-page-sub">Atur jumlah meja yang aktif di sistem</div>
                        <div className="kd-table-wrap" style={{ maxWidth: 480 }}>
                            <table className="kd-table">
                                <thead><tr><th>Konfigurasi</th><th>Nilai</th><th>Aksi</th></tr></thead>
                                <tbody>
                                    {konfigurasi.length === 0 ? (
                                        <tr><td colSpan={3} className="kd-empty">Memuat konfigurasi...</td></tr>
                                    ) : konfigurasi.map((k) => (
                                        <KonfRow key={k.id} item={k} onSave={async (nama, val) => {
                                            try { await updateKonfigurasi(nama, val); showToast("Konfigurasi disimpan"); loadKonfigurasi(); }
                                            catch { showToast("Gagal menyimpan"); }
                                        }} />
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
                        <div className="kd-modal-title">{modal.mode === "add" ? "Tambah Menu Baru" : "Edit Menu"}</div>
                        {[
                            { key: "nama_item", label: "Nama Item (slug)", placeholder: "kopi_susu" },
                            { key: "label_item", label: "Nama Tampil", placeholder: "Kopi Susu" },
                            { key: "price", label: "Harga (Rp)", placeholder: "15000", type: "number" },
                            { key: "disc_perc", label: "Diskon (%)", placeholder: "0", type: "number" },
                        ].map(({ key, label, placeholder, type }) => (
                            <div className="kd-field" key={key}>
                                <label className="kd-label">{label}</label>
                                <input className="kd-input" type={type || "text"} placeholder={placeholder}
                                    value={modal.data[key]}
                                    onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, [key]: e.target.value } }))} />
                            </div>
                        ))}
                        <div className="kd-field">
                            <label className="kd-label">Deskripsi</label>
                            <textarea className="kd-input" placeholder="Ceritain dikit soal menu ini..." rows={3}
                                style={{ resize: "vertical", lineHeight: 1.6 }}
                                value={modal.data.desc_item}
                                onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, desc_item: e.target.value } }))} />
                        </div>
                        <div className="kd-field">
                            <label className="kd-label">Foto Menu</label>
                            <div className={`kd-img-upload-area${imgPreview ? " has-preview" : ""}`}
                                onClick={() => !uploading && fileInputRef.current?.click()}>
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
                            <input ref={fileInputRef} type="file" accept="image/*" className="kd-file-input" onChange={handleFileChange} />
                        </div>
                        <div className="kd-field">
                            <label className="kd-label">Kategori</label>
                            <select className="kd-input" value={modal.data.id_kategori}
                                onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, id_kategori: e.target.value } }))}>
                                <option value="">Pilih kategori</option>
                                {kategori.map((k) => (
                                    <option key={k.id_kategori} value={k.id_kategori}>{k.nama_kategori}</option>
                                ))}
                            </select>
                        </div>
                        <div className="kd-modal-footer">
                            <button className="kd-btn-cancel" onClick={() => setModal(null)}>Batal</button>
                            <button className="kd-btn-save" onClick={saveMenu} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
                        </div>
                    </div>
                </div>
            )}

            {modal?.type === "kat" && (
                <div className="kd-modal-wrap" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
                    <div className="kd-modal">
                        <div className="kd-modal-title">{modal.mode === "add" ? "Tambah Kategori" : "Edit Kategori"}</div>
                        <div className="kd-field">
                            <label className="kd-label">Nama Kategori</label>
                            <input className="kd-input" type="text" placeholder="Minuman"
                                value={modal.data.nama_kategori}
                                onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, nama_kategori: e.target.value } }))} />
                        </div>
                        <div className="kd-modal-footer">
                            <button className="kd-btn-cancel" onClick={() => setModal(null)}>Batal</button>
                            <button className="kd-btn-save" onClick={saveKategori} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
                        </div>
                    </div>
                </div>
            )}

            {confirm && (
                <div className="kd-confirm-wrap">
                    <div className="kd-confirm">
                        <div className="kd-confirm-title">Hapus {confirm.type === "menu" ? "menu" : "kategori"} ini?</div>
                        <div className="kd-confirm-msg"><strong>{confirm.name}</strong> akan dihapus permanen.</div>
                        <div className="kd-confirm-btns">
                            <button className="kd-btn-cancel" onClick={() => setConfirm(null)}>Batal</button>
                            <button className="kd-btn-danger"
                                onClick={() => confirm.type === "menu" ? handleDeleteMenu(confirm.id) : handleDeleteKategori(confirm.id)}>
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {detailOrder && (() => {
                let items = [];
                try { items = JSON.parse(detailOrder.data_order || "[]"); } catch { items = []; }
                const sub = items.reduce((a, b) => a + (Number(b.price) * Number(b.qty)), 0);
                const tax = Math.round(sub * 0.11);
                const svc = Math.round(sub * 0.05);
                const total = calcTotal(detailOrder);
                return (
                    <div className="kd-modal-wrap" onClick={(e) => { if (e.target === e.currentTarget) setDetailOrder(null); }}>
                        <div className="kd-modal" style={{ maxWidth: 500 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                                <div>
                                    <div className="kd-modal-title" style={{ marginBottom: 4 }}>Detail Pesanan</div>
                                    <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>{detailOrder.payment_refcode}</div>
                                </div>
                                <span style={{
                                    display: "inline-block", padding: "3px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                                    background: detailOrder.status === "sukses" ? "rgba(39,174,96,0.1)" : "rgba(181,101,29,0.1)",
                                    color: detailOrder.status === "sukses" ? "var(--green)" : "var(--amber)",
                                }}>{detailOrder.status}</span>
                            </div>

                            <div style={{ display: "flex", gap: 24, marginBottom: 20, fontSize: 13 }}>
                                <div>
                                    <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 2 }}>MEJA</div>
                                    <div style={{ fontWeight: 500 }}>{detailOrder.no_meja ? `Meja ${detailOrder.no_meja}` : "-"}</div>
                                </div>
                                <div>
                                    <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 2 }}>METODE</div>
                                    <div style={{ fontWeight: 500, textTransform: "uppercase" }}>{detailOrder.pay_via}</div>
                                </div>
                                <div>
                                    <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 2 }}>TANGGAL</div>
                                    <div style={{ fontWeight: 500 }}>{detailOrder.pay_at}</div>
                                </div>
                            </div>

                            <div style={{ background: "var(--bg2)", borderRadius: 10, padding: "4px 0", marginBottom: 16 }}>
                                {items.length === 0 ? (
                                    <div style={{ padding: 16, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Data item tidak tersedia</div>
                                ) : items.map((item, i) => (
                                    <div key={i} style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "10px 16px",
                                        borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none",
                                        fontSize: 13,
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 500, color: "var(--text)" }}>{item.nama}</div>
                                            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{rp(item.price)} × {item.qty}</div>
                                        </div>
                                        <div style={{ fontWeight: 500, color: "var(--brown)" }}>{rp(item.price * item.qty)}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ fontSize: 13 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "var(--text-muted)" }}>
                                    <span>Subtotal</span><span>{rp(sub)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "var(--text-muted)" }}>
                                    <span>Pajak (11%)</span><span>{rp(tax)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "var(--text-muted)" }}>
                                    <span>Biaya layanan (5%)</span><span>{rp(svc)}</span>
                                </div>
                                <div style={{
                                    display: "flex", justifyContent: "space-between",
                                    padding: "10px 0 4px", marginTop: 6,
                                    borderTop: "1px solid var(--border)",
                                    fontFamily: "Fraunces, serif", fontSize: 18, color: "var(--brown)",
                                }}>
                                    <span>Total</span>
                                    <span style={{ color: "var(--amber)" }}>{rp(total)}</span>
                                </div>
                            </div>

                            <div className="kd-modal-footer">
                                {detailOrder.status === "proses" && (
                                    <button className="kd-btn-save" style={{ background: "var(--green)" }}
                                        onClick={async () => {
                                            try {
                                                await updateOrderStatus(detailOrder.id, "sukses");
                                                showToast("Pembayaran dikonfirmasi");
                                                setDetailOrder(null);
                                                loadOrders();
                                            } catch { showToast("Gagal update status"); }
                                        }}>
                                        Konfirmasi Pembayaran
                                    </button>
                                )}
                                <button className="kd-btn-cancel" onClick={() => setDetailOrder(null)}>Tutup</button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <div className={`kd-toast${toast.show ? " show" : ""}`}>{toast.msg}</div>
        </div>
    );
}
