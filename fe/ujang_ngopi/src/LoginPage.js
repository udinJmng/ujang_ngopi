import { useState } from "react";
import "./styles/panel.css";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function LoginPage({ onLogin, theme, toggleTheme }) {
    const [tab, setTab] = useState("karyawan");
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const url = tab === "admin"
                ? `${API_BASE}/api/akun_karyawan/admin/login`
                : `${API_BASE}/api/akun_karyawan/login`;

            const body = tab === "admin"
                ? { username: form.username, password: form.password }
                : { username_login: form.username, password_login: form.password };

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }

            localStorage.setItem("token", data.token);
            onLogin(tab === "admin" ? { role: "admin" } : { role: "karyawan", ...data.data });
        } catch {
            setError("Tidak bisa terhubung ke server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lp-wrap">
            <div className="lp-overlay" />
            <div className="lp-card">
                <div className="lp-logo">Ujang <span>Ngopi</span></div>
                <div className="lp-subtitle">Masuk ke sistem kasir</div>

                <div className="lp-tabs">
                    <button
                        className={`lp-tab${tab === "karyawan" ? " active" : ""}`}
                        onClick={() => { setTab("karyawan"); setError(""); }}
                    >
                        Karyawan
                    </button>
                    <button
                        className={`lp-tab${tab === "admin" ? " active" : ""}`}
                        onClick={() => { setTab("admin"); setError(""); }}
                    >
                        Admin
                    </button>
                </div>

                {error && <div className="lp-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="lp-field">
                        <label className="lp-label">Username</label>
                        <input
                            className="lp-input"
                            type="text"
                            placeholder={tab === "admin" ? "admin" : "username karyawan"}
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="lp-field">
                        <label className="lp-label">Password</label>
                        <input
                            className="lp-input"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <button className="lp-btn" type="submit" disabled={loading}>
                        {loading ? "Memuat..." : "Masuk"}
                    </button>
                </form>
                <div className="lp-theme-row">
                    <button className="lp-theme-btn" onClick={toggleTheme}>
                        {theme === "dark" ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
                    </button>
                </div>
            </div>
        </div>
    );
}
