export default function Hero({ menuRef }) {
  return (
    <section className="un-hero">
      <div className="un-hero-img" />
      <div className="un-hero-grain" />
      <div className="un-hero-content">
        <div className="un-hero-tag">Ujang Ngopi · Surakarta</div>
        <h1>Crafted for<em>Coffee Lovers</em></h1>
        <p>Setiap cangkir dibuat dengan biji pilihan single origin, diseduh dengan presisi untuk rasa yang tak terlupakan.</p>
        <div className="un-hero-cta">
          <button
            className="un-btn-primary"
            onClick={() => menuRef.current?.scrollIntoView({ behavior: "smooth" })}
          >
            Lihat Menu
          </button>
          <button className="un-btn-ghost">Tentang Kami</button>
        </div>
      </div>
      <div className="un-hero-stats">
        <div className="un-stat-item">
          <div className="un-stat-num">12+</div>
          <div className="un-stat-lbl">Varian Kopi</div>
        </div>
        <div className="un-stat-item">
          <div className="un-stat-num">4.9</div>
          <div className="un-stat-lbl">Rating</div>
        </div>
        <div className="un-stat-item">
          <div className="un-stat-num">5K+</div>
          <div className="un-stat-lbl">Pelanggan</div>
        </div>
      </div>
    </section>
  );
}
