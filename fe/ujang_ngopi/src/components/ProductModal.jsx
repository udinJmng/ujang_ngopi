import { rp, fp, imgUrl } from "../utils/helpers";

export default function ProductModal({ item, onClose, onAddToCart }) {
  return (
    <div
      className={`un-product-modal-wrap${item ? " open" : ""}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {item && (
        <div className="un-product-modal">
          <button className="un-modal-close" onClick={onClose}>×</button>
          <img src={imgUrl(item.gambar_item)} className="un-modal-img" alt={item.label_item} />
          <div className="un-modal-body">
            <div className="un-modal-title">{item.label_item}</div>
            <div className="un-modal-cat">{item.nama_kategori}</div>
            <div className="un-modal-desc">{item.desc_item || item.nama_item}</div>
            <div className="un-modal-footer">
              <div className="un-modal-price-wrap">
                <div className="un-modal-price">{rp(fp(item))}</div>
                {item.disc_perc > 0 && (
                  <div className="un-modal-price-old">{rp(item.price)}</div>
                )}
              </div>
              <button
                className="un-modal-add-btn"
                onClick={() => { onAddToCart(item.id_menu); onClose(); }}
              >
                Tambah ke Pesanan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
