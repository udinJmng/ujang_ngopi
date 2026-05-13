import { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import KaryawanDashboard from "./KaryawanDashboard";
import AdminPanel from "./AdminPanel";
import UjangNgopi from "./UjangNgopi";

const isPanel = window.location.pathname.startsWith("/panel");
const mejaMatch = window.location.pathname.match(/^\/meja\/(\d+)$/);
const MAX_MEJA = 5;
const mejaNum = mejaMatch ? parseInt(mejaMatch[1], 10) : null;
const nomorMeja = mejaNum >= 1 && mejaNum <= MAX_MEJA ? mejaNum : null;
const isMejaInvalid = mejaMatch !== null && nomorMeja === null;

export default function App() {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

    if (isMejaInvalid) return (
        <div style={{
            minHeight: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            fontFamily: "Inter, sans-serif", background: "#faf8f5", color: "#2c1a0e",
            gap: 12, padding: 24, textAlign: "center"
        }}>
            <div style={{ fontSize: 32, fontFamily: "Fraunces, serif", color: "#3d2314" }}>
                Meja tidak ditemukan
            </div>
            <div style={{ fontSize: 14, color: "#8c7060" }}>
                Error Cuy<br />
                Order secara manual jika error ini tak kunjung balik.
                <br/>
                Hmpppphhhh
            </div>
        </div>
    );

    if (!isPanel) return <UjangNgopi theme={theme} toggleTheme={toggleTheme} nomorMeja={nomorMeja} />;

    if (!user) return <LoginPage onLogin={setUser} theme={theme} toggleTheme={toggleTheme} />;

    if (user.role === "admin") return <AdminPanel onLogout={() => setUser(null)} theme={theme} toggleTheme={toggleTheme} />;
    if (user.role === "karyawan") return <KaryawanDashboard user={user} onLogout={() => setUser(null)} theme={theme} toggleTheme={toggleTheme} />;

    return null;
}
