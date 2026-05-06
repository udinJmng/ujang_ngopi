import { rp, fp, imgUrl } from "../utils/helpers";

export default function MenuCard({ item, index, onAddToCart, onOpenModal }) {
  return (
    <div
      className="un-card"
      style={{ animationDelay: `${index * 0.07}s` }}
      onClick={() => onOpenModal(item)}
    >
      <div className="un-card-img-wrap">
        <img src={imgUrl(item.gambar_item)} alt={item.label_item} loading="lazy" />
        <span className="un-card-label">{item.nama_kategori}</span>
        {item.disc_perc > 0 && (
          <span className="un-card-discount">-{item.disc_perc}%</span>
        )}
      </div>
      <div className="un-card-body">
        <div className="un-card-name">{item.label_item}</div>
        <div className="un-card-desc">{item.desc_item || item.nama_item}</div>
        <div className="un-card-footer">
          <div className="un-card-price">
            <div className="un-price-now">{rp(fp(item))}</div>
            {item.disc_perc > 0 && (
              <div className="un-price-old">{rp(item.price)}</div>
            )}
          </div>
          <button
            className="un-add-btn"
            onClick={(e) => { e.stopPropagation(); onAddToCart(item.id_menu); }}
            title="Tambah ke pesanan"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
