import { useState, useEffect, useRef, useCallback } from "react";
import "./styles/global.css";

import { fetchMenu, fetchKategori, postOrder } from "./api/api";
import { fp } from "./utils/helpers";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MenuGrid from "./components/MenuGrid";
import OrderPanel from "./components/OrderPanel";
import ProductModal from "./components/ProductModal";
import Toast from "./components/Toast";

export default function UjangNgopi({ theme, toggleTheme, nomorMeja }) {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([{ label: "Semua", value: "" }]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [modalItem, setModalItem] = useState(null);
  const [toast, setToast] = useState({ msg: "", show: false });
  const toastTimer = useRef(null);
  const menuRef = useRef(null);

  // Fetch menu & kategori dari API
  useEffect(() => {
    Promise.all([fetchMenu(), fetchKategori()])
      .then(([menuData, katData]) => {
        setMenu(menuData);
        setCategories([
          { label: "Semua", value: "" },
          ...katData.map((k) => ({ label: k.nama_kategori, value: k.id_kategori })),
        ]);
      })
      .catch(() => showToast("Gagal memuat menu dari server"))
      .finally(() => setLoading(false));
  }, []);

  const showToast = useCallback((msg) => {
    setToast({ msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  }, []);

  const addToCart = useCallback((id) => {
    const item = menu.find((x) => x.id_menu === id);
    if (!item) return;
    setCart((prev) => {
      const existing = prev.find((x) => x.id_menu === id);
      if (existing) return prev.map((x) => x.id_menu === id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { ...item, qty: 1 }];
    });
    showToast(`${item.label_item} ditambahkan`);
  }, [menu, showToast]);

  const updateQty = useCallback((id, change) => {
    setCart((prev) =>
      prev.map((x) => x.id_menu === id ? { ...x, qty: x.qty + change } : x)
         .filter((x) => x.qty > 0)
    );
  }, []);

  const removeItem = useCallback((id) => {
    setCart((prev) => prev.filter((x) => x.id_menu !== id));
  }, []);

  const checkout = useCallback(({ payVia }) => {
    const payload = {
      data_order: cart.map((x) => ({ id_menu: x.id_menu, nama: x.label_item, qty: x.qty, price: fp(x) })),
      pay_via: payVia,
      status: "proses",
      no_meja: nomorMeja,
    };
    return postOrder(payload).then((res) => {
      setCart([]);
      return res;
    });
  }, [cart, nomorMeja]);

  const totalQty = cart.reduce((a, b) => a + b.qty, 0);

  return (
    <div className="un-root">
      <Navbar totalQty={totalQty} onCartOpen={() => setCartOpen(true)} theme={theme} toggleTheme={toggleTheme} nomorMeja={nomorMeja} />

      <Hero menuRef={menuRef} />

      <MenuGrid
        menu={menu}
        categories={categories}
        filter={filter}
        loading={loading}
        menuRef={menuRef}
        onFilterChange={setFilter}
        onAddToCart={addToCart}
        onOpenModal={setModalItem}
      />

      <footer className="un-footer-strip">
        <div className="un-footer-logo">Ujang Ngopi</div>
        <div>Ujang Ngopi · Surakarta</div>
        <div>Open 07.00 – 22.00 WIB</div>
      </footer>

      <OrderPanel
        cart={cart}
        cartOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateQty}
        onRemoveItem={removeItem}
        onCheckout={checkout}
        nomorMeja={nomorMeja}
      />

      <ProductModal
        item={modalItem}
        onClose={() => setModalItem(null)}
        onAddToCart={addToCart}
      />

      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
