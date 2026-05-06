import MenuCard from "./MenuCard";

export default function MenuGrid({ menu, categories, filter, loading, menuRef, onFilterChange, onAddToCart, onOpenModal }) {
  const filtered = filter ? menu.filter((x) => x.id_kategori === filter) : menu;

  return (
    <main className="un-main">
      <div className="un-section-header" ref={menuRef}>
        <h2>Menu <span>Pilihan</span></h2>
        <span className="un-view-all">Semua menu →</span>
      </div>

      <div className="un-cats">
        {categories.map((c) => (
          <button
            key={c.value}
            className={`un-cat${filter === c.value ? " active" : ""}`}
            onClick={() => onFilterChange(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="un-products">
        {loading ? (
          <p style={{ color: "var(--text-muted)", gridColumn: "1/-1" }}>Memuat menu...</p>
        ) : (
          filtered.map((item, i) => (
            <MenuCard
              key={item.id_menu}
              item={item}
              index={i}
              onAddToCart={onAddToCart}
              onOpenModal={onOpenModal}
            />
          ))
        )}
      </div>
    </main>
  );
}
