import { useState } from "react";
import { rp, fp, imgUrl } from "../utils/helpers";

const STEPS = { cart: "cart", payment: "payment", success: "success" };

export default function OrderPanel({ cart, cartOpen, onClose, onUpdateQty, onRemoveItem, onCheckout }) {
  const [step, setStep] = useState(STEPS.cart);
  const [payVia, setPayVia] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const totalQty = cart.reduce((a, b) => a + b.qty, 0);
  const sub = cart.reduce((a, b) => a + fp(b) * b.qty, 0);
  const tax = Math.round(sub * 0.11);
  const svc = Math.round(sub * 0.05);
  const total = sub + tax + svc;

  const handleClose = () => {
    onClose();
    setTimeout(() => setStep(STEPS.cart), 400);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const res = await onCheckout({ payVia });
      setOrderId(res?.id ?? "-");
      setStep(STEPS.success);
    } catch {
      // error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`un-cart-overlay${cartOpen ? " open" : ""}`}
        onClick={handleClose}
      />

      <div className={`un-order-panel${cartOpen ? " open" : ""}`}>

        {step === STEPS.cart && (
          <>
            <div className="un-panel-header">
              <div className="un-panel-title">Pesanan</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="un-item-count">{totalQty} item</span>
                <button className="un-panel-close" onClick={handleClose}>×</button>
              </div>
            </div>

            <div className="un-cart-items">
              {cart.length === 0 ? (
                <div className="un-cart-empty">
                  <p>Keranjang masih kosong</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id_menu} className="un-cart-item">
                    <div className="un-ci-left">
                      <img src={imgUrl(item.gambar_item)} className="un-ci-img" alt={item.label_item} />
                      <div>
                        <div className="un-ci-name">{item.label_item}</div>
                        <div className="un-ci-cat">{item.nama_kategori}</div>
                        <div className="un-ci-price">{rp(fp(item))}</div>
                      </div>
                    </div>
                    <div className="un-ci-right">
                      <button className="un-ci-remove" onClick={() => onRemoveItem(item.id_menu)}>×</button>
                      <div className="un-ci-qty-ctrl">
                        <button className="un-ci-btn" onClick={() => onUpdateQty(item.id_menu, -1)}>-</button>
                        <span className="un-ci-qty-num">{item.qty}</span>
                        <button className="un-ci-btn" onClick={() => onUpdateQty(item.id_menu, 1)}>+</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="un-panel-divider" />
            <div className="un-row-fee"><span>Subtotal</span><span>{rp(sub)}</span></div>
            <div className="un-row-fee"><span>Pajak (11%)</span><span>{rp(tax)}</span></div>
            <div className="un-row-fee"><span>Biaya layanan (5%)</span><span>{rp(svc)}</span></div>
            <div className="un-panel-divider" />
            <div className="un-row-total"><span>Total</span><span>{rp(total)}</span></div>

            <button
              className="un-pay-btn"
              disabled={cart.length === 0}
              onClick={() => setStep(STEPS.payment)}
            >
              Lanjut ke Pembayaran
            </button>
          </>
        )}

        {step === STEPS.payment && (
          <>
            <div className="un-panel-header">
              <button className="un-panel-back" onClick={() => setStep(STEPS.cart)}>
                ← Kembali
              </button>
              <button className="un-panel-close" onClick={handleClose}>×</button>
            </div>

            <div className="un-pay-section-title">Pilih metode pembayaran</div>

            <div className="un-pay-methods">
              <button
                className={`un-pay-method${payVia === "cash" ? " selected" : ""}`}
                onClick={() => setPayVia("cash")}
              >
                <div className="un-pay-method-name">Tunai</div>
                <div className="un-pay-method-desc">Bayar langsung di kasir</div>
              </button>
              <button
                className={`un-pay-method${payVia === "qris" ? " selected" : ""}`}
                onClick={() => setPayVia("qris")}
              >
                <div className="un-pay-method-name">QRIS</div>
                <div className="un-pay-method-desc">Scan QR di kasir</div>
              </button>
            </div>

            <div className="un-panel-divider" />

            <div className="un-pay-summary">
              <div className="un-pay-summary-row">
                <span>{totalQty} item</span>
                <span>{rp(sub)}</span>
              </div>
              <div className="un-pay-summary-row muted">
                <span>Pajak + layanan</span>
                <span>{rp(tax + svc)}</span>
              </div>
              <div className="un-pay-summary-row total">
                <span>Total bayar</span>
                <span>{rp(total)}</span>
              </div>
            </div>

            <button
              className="un-pay-btn"
              onClick={handleConfirmPayment}
              disabled={loading}
            >
              {loading ? "Memproses..." : `Konfirmasi — ${rp(total)}`}
            </button>
          </>
        )}

        {step === STEPS.success && (
          <div className="un-pay-success">
            <div className="un-pay-success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="un-pay-success-title">Pesanan diterima</div>
            <div className="un-pay-success-sub">
              Silakan tunjukkan nomor pesanan ke kasir
            </div>
            <div className="un-pay-order-id">#{orderId}</div>

            <div className="un-pay-receipt">
              {cart.map((item) => (
                <div key={item.id_menu} className="un-pay-receipt-row">
                  <span>{item.label_item} ×{item.qty}</span>
                  <span>{rp(fp(item) * item.qty)}</span>
                </div>
              ))}
              <div className="un-pay-receipt-divider" />
              <div className="un-pay-receipt-row muted">
                <span>Pajak + layanan</span>
                <span>{rp(tax + svc)}</span>
              </div>
              <div className="un-pay-receipt-row bold">
                <span>Total</span>
                <span>{rp(total)}</span>
              </div>
              <div className="un-pay-receipt-row muted" style={{ marginTop: 8 }}>
                <span>Metode</span>
                <span>{payVia === "cash" ? "Tunai" : "QRIS"}</span>
              </div>
            </div>

            <button className="un-pay-btn" onClick={handleClose}>
              Selesai
            </button>
          </div>
        )}

      </div>
    </>
  );
}
