import { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import KaryawanDashboard from "./KaryawanDashboard";
import AdminPanel from "./AdminPanel";
import UjangNgopi from "./UjangNgopi";

const isPanel = window.location.pathname.startsWith("/panel");

export default function App() {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

    if (!isPanel) return <UjangNgopi theme={theme} toggleTheme={toggleTheme} />;

    if (!user) return <LoginPage onLogin={setUser} theme={theme} toggleTheme={toggleTheme} />;

    if (user.role === "admin") return <AdminPanel onLogout={() => setUser(null)} theme={theme} toggleTheme={toggleTheme} />;
    if (user.role === "karyawan") return <KaryawanDashboard user={user} onLogout={() => setUser(null)} theme={theme} toggleTheme={toggleTheme} />;

    return null;
}
