import { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import KaryawanDashboard from "./KaryawanDashboard";
import AdminPanel from "./AdminPanel";
import UjangNgopi from "./UjangNgopi";
import { getMeja } from "./api/api";

const path = window.location.pathname;
const isPanel = path.startsWith("/panel");
const isMejaPath = path.startsWith("/meja");
const mejaMatch = path.match(/^\/meja\/(\d+)$/);
const mejaNum = mejaMatch ? parseInt(mejaMatch[1], 10) : null;

const noAccessStyle = {
    minHeight: "100vh",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    fontFamily: "Inter, sans-serif",
    background: "#faf8f5", color: "#2c1a0e",
    gap: 10, padding: 24, textAlign: "center",
};

export default function App() {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
    const [maxMeja, setMaxMeja] = useState(null);
    const [mejaLoading, setMejaLoading] = useState(isMejaPath);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        if (!isMejaPath) return;
        getMeja()
            .then((val) => setMaxMeja(Number(val)))
            .catch(() => setMaxMeja(0))
            .finally(() => setMejaLoading(false));
    }, []);

    const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    if (!isPanel && !isMejaPath) return (
        <div style={noAccessStyle}>
            <div style={{ fontSize: 26, fontFamily: "Fraunces, serif", color: "#3d2314" }}>
                Ujang Ngopi
            </div>
            <div style={{ fontSize: 14, color: "#8c7060", lineHeight: 1.7 }}>
                Scan QR code di meja kamu untuk mulai memesan.<br />
            </div>
        </div>
    );

    if (mejaLoading) return (
        <div style={{ ...noAccessStyle, gap: 0 }}>
            <div style={{ fontSize: 14, color: "#8c7060" }}>Memuat...</div>
        </div>
    );

    const nomorMeja = mejaNum >= 1 && mejaNum <= maxMeja ? mejaNum : null;
    const isMejaInvalid = isMejaPath && nomorMeja === null;

    if (isMejaInvalid) return (
        <div style={noAccessStyle}>
            <div style={{ fontSize: 26, fontFamily: "Fraunces, serif", color: "#3d2314" }}>
                Meja tidak ditemukan
            </div>
            <div style={{ fontSize: 14, color: "#8c7060", lineHeight: 1.7 }}>
                    Web Invalid
            </div>
        </div>
    );

    if (isMejaPath) return <UjangNgopi theme={theme} toggleTheme={toggleTheme} nomorMeja={nomorMeja} />;

    if (!user) return <LoginPage onLogin={setUser} theme={theme} toggleTheme={toggleTheme} />;

    if (user.role === "admin") return <AdminPanel onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />;
    if (user.role === "karyawan") return <KaryawanDashboard user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />;

    return null;
}
