export default function Navbar({ totalQty, onCartOpen, theme, toggleTheme, nomorMeja }) {
  return (
    <nav className="un-nav">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div className="un-logo">Ujang <span>Ngopi</span></div>
        {nomorMeja && (
          <span className="un-meja-badge">Meja {nomorMeja}</span>
        )}
      </div>
      <div className="un-nav-actions">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", userSelect: "none" }}>
            {theme === "dark" ? "Dark" : "Light"}
          </span>
          <button
            className="un-theme-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "Ganti ke light mode" : "Ganti ke dark mode"}
            aria-label="Toggle dark mode"
          />
        </div>
        <button className="un-nav-btn" onClick={onCartOpen}>Pesanan</button>
        <button className="un-cart-btn" onClick={onCartOpen}>
          Keranjang
          <span className="un-cart-count">{totalQty}</span>
        </button>
      </div>
    </nav>
  );
}
