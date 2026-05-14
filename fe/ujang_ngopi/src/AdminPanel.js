import { useState, useEffect, useCallback } from "react";
import "./styles/panel.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

const emptyForm = { fName: "", lName: "", username_login: "", password_login: "", avatar_url: "" };

export default function AdminPanel({ onLogout, theme, toggleTheme }) {
    const [karyawan, setKaryawan] = useState([]);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState("");
    const [toast, setToast] = useState({ msg: "", show: false });

    const showToast = useCallback((msg) => {
        setToast({ msg, show: true });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
    }, []);

    const fetchKaryawan = useCallback(() => {
        fetch(`${API_BASE}/api/akun_karyawan`)
            .then((r) => r.json())
            .then(setKaryawan)
            .catch(() => showToast("Gagal memuat data karyawan"));
    }, [showToast]);

    useEffect(() => { fetchKaryawan(); }, [fetchKaryawan]);

    const saveKaryawan = async () => {
        setModalError("");
        setSaving(true);
        const { data, mode } = modal;
        const url = mode === "edit" ? `${API_BASE}/api/akun_karyawan/${data.id}` : `${API_BASE}/api/akun_karyawan`;
        const method = mode === "edit" ? "PUT" : "POST";
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (!res.ok) { setModalError(json.message || "Gagal menyimpan"); return; }
            showToast(mode === "edit" ? "Data karyawan diperbarui" : "Akun karyawan berhasil dibuat");
            setModal(null);
            fetchKaryawan();
        } catch {
            setModalError("Tidak bisa terhubung ke server");
        } finally {
            setSaving(false);
        }
    };

    const deleteKaryawan = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/akun_karyawan/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) { showToast(json.message); return; }
            showToast("Akun karyawan dihapus");
            fetchKaryawan();
        } catch {
            showToast("Gagal menghapus");
        } finally {
            setConfirm(null);
        }
    };

    const filtered = karyawan.filter((k) =>
        `${k.fName} ${k.lName} ${k.username_login}`.toLowerCase().includes(search.toLowerCase())
    );

    const initials = (k) => `${k.fName?.[0] || ""}${k.lName?.[0] || ""}`.toUpperCase();

    return (
        <div className="ap-root">
            <aside className="ap-sidebar">
                <div className="ap-sidebar-logo">Ujang <span>Ngopi</span></div>
                <div className="ap-sidebar-role">Admin Panel</div>

                <button className="ap-nav-item active">
                    Akun Karyawan
                </button>

                <div className="sidebar-bottom">
                    <button className="sidebar-theme-btn" onClick={toggleTheme}>
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>
                    <button className="ap-logout" onClick={onLogout}>
                        Keluar
                    </button>
                </div>
            </aside>

            <main className="ap-main">
                <div className="ap-page-title">Manajemen <span>Karyawan</span></div>
                <div className="ap-page-sub">Kelola akun karyawan yang bisa akses sistem kasir</div>

                <div className="ap-stats">
                    <div className="ap-stat-card">
                        <div className="ap-stat-num">{karyawan.length}</div>
                        <div className="ap-stat-lbl">Total Karyawan</div>
                    </div>
                </div>

                <div className="ap-toolbar">
                    <input
                        className="ap-search"
                        placeholder="Cari nama atau username..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        className="ap-add-btn"
                        onClick={() => { setModalError(""); setModal({ mode: "add", data: { ...emptyForm } }); }}
                    >
                        + Tambah Karyawan
                    </button>
                </div>

                <div className="ap-table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Username</th>
                                <th>ID</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={4} className="ap-empty">Belum ada karyawan terdaftar</td></tr>
                            ) : filtered.map((k) => (
                                <tr key={k.id}>
                                    <td>
                                        <div className="ap-name-cell">
                                            <div className="ap-avatar">{initials(k)}</div>
                                            <span>{k.fName} {k.lName}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: "var(--text-muted)" }}>{k.username_login}</td>
                                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{k.id}</td>
                                    <td>
                                        <div className="ap-actions">
                                            <button
                                                className="ap-btn-edit"
                                                onClick={() => { setModalError(""); setModal({ mode: "edit", data: { ...k, password_login: "" } }); }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="ap-btn-del"
                                                onClick={() => setConfirm({ id: k.id, name: `${k.fName} ${k.lName}` })}
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
            </main>

            {modal && (
                <div className="ap-modal-wrap" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
                    <div className="ap-modal">
                        <div className="ap-modal-title">
                            {modal.mode === "add" ? "Tambah Karyawan Baru" : "Edit Data Karyawan"}
                        </div>
                        {modalError && <div className="ap-error">{modalError}</div>}

                        <div className="ap-row">
                            <div className="ap-field">
                                <label className="ap-label">Nama Depan</label>
                                <input
                                    className="ap-input" type="text" placeholder="Budi"
                                    value={modal.data.fName}
                                    onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, fName: e.target.value } }))}
                                />
                            </div>
                            <div className="ap-field">
                                <label className="ap-label">Nama Belakang</label>
                                <input
                                    className="ap-input" type="text" placeholder="Santoso"
                                    value={modal.data.lName}
                                    onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, lName: e.target.value } }))}
                                />
                            </div>
                        </div>

                        <div className="ap-field">
                            <label className="ap-label">Username</label>
                            <input
                                className="ap-input" type="text" placeholder="budi_santoso"
                                value={modal.data.username_login}
                                onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, username_login: e.target.value } }))}
                            />
                        </div>

                        <div className="ap-field">
                            <label className="ap-label">
                                {modal.mode === "edit" ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
                            </label>
                            <input
                                className="ap-input" type="password" placeholder="••••••••"
                                value={modal.data.password_login}
                                onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, password_login: e.target.value } }))}
                            />
                        </div>

                        <div className="ap-field">
                            <label className="ap-label">URL Avatar (opsional)</label>
                            <input
                                className="ap-input" type="text" placeholder="https://..."
                                value={modal.data.avatar_url}
                                onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, avatar_url: e.target.value } }))}
                            />
                        </div>

                        <div className="ap-modal-footer">
                            <button className="ap-btn-cancel" onClick={() => setModal(null)}>Batal</button>
                            <button className="ap-btn-save" onClick={saveKaryawan} disabled={saving}>
                                {saving ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirm && (
                <div className="ap-confirm-wrap">
                    <div className="ap-confirm">
                        <div className="ap-confirm-title">Hapus akun ini?</div>
                        <div className="ap-confirm-msg">
                            Akun <strong>{confirm.name}</strong> akan dihapus permanen.
                        </div>
                        <div className="ap-confirm-btns">
                            <button className="ap-btn-cancel" onClick={() => setConfirm(null)}>Batal</button>
                            <button className="ap-btn-danger" onClick={() => deleteKaryawan(confirm.id)}>Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`ap-toast${toast.show ? " show" : ""}`}>{toast.msg}</div>
        </div>
    );
}
