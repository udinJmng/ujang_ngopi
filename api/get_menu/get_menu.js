const express = require("express");
const router = express.Router();
const db = require("../db/config");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET semua menu (public)
router.get("/", (req, res) => {
    const query = `
        SELECT lm.*, tk.nama_kategori 
        FROM list_menu lm
        LEFT JOIN tabel_kategori tk ON lm.id_kategori = tk.id_kategori
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        res.json(results);
    });
});

// GET menu by id (public)
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT lm.*, tk.nama_kategori 
        FROM list_menu lm
        LEFT JOIN tabel_kategori tk ON lm.id_kategori = tk.id_kategori
        WHERE lm.id_menu = ?
    `;
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        if (results.length === 0) return res.status(404).json({ message: "Menu tidak ditemukan" });
        res.json(results[0]);
    });
});

// GET menu by kategori (public)
router.get("/kategori/:id_kategori", (req, res) => {
    const { id_kategori } = req.params;
    const query = `
        SELECT lm.*, tk.nama_kategori 
        FROM list_menu lm
        LEFT JOIN tabel_kategori tk ON lm.id_kategori = tk.id_kategori
        WHERE lm.id_kategori = ?
    `;
    db.query(query, [id_kategori], (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        res.json(results);
    });
});

// POST tambah menu (karyawan/admin only)
router.post("/", verifyToken, requireRole("karyawan", "admin"), (req, res) => {
    const { nama_item, label_item, gambar_item, price, disc_perc, id_kategori, desc_item } = req.body;
    if (!nama_item || !label_item || !price)
        return res.status(400).json({ message: "nama_item, label_item, dan price wajib diisi" });

    const parsedPrice = parseFloat(price);
    const parsedDisc = parseInt(disc_perc) || 0;
    if (isNaN(parsedPrice) || parsedPrice <= 0)
        return res.status(400).json({ message: "Harga tidak valid" });
    if (parsedDisc < 0 || parsedDisc > 100)
        return res.status(400).json({ message: "Diskon harus antara 0-100" });

    const query = "INSERT INTO list_menu (nama_item, label_item, gambar_item, price, disc_perc, id_kategori, desc_item) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(query, [nama_item, label_item, gambar_item || "", parsedPrice, parsedDisc, id_kategori || null, desc_item || ""], (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        res.status(201).json({ message: "Menu berhasil ditambahkan", id_menu: results.insertId });
    });
});

// PUT update menu (karyawan/admin only)
router.put("/:id", verifyToken, requireRole("karyawan", "admin"), (req, res) => {
    const { id } = req.params;
    const { nama_item, label_item, gambar_item, price, disc_perc, id_kategori, desc_item } = req.body;

    const parsedPrice = parseFloat(price);
    const parsedDisc = parseInt(disc_perc) || 0;
    if (isNaN(parsedPrice) || parsedPrice <= 0)
        return res.status(400).json({ message: "Harga tidak valid" });

    const query = "UPDATE list_menu SET nama_item=?, label_item=?, gambar_item=?, price=?, disc_perc=?, id_kategori=?, desc_item=? WHERE id_menu=?";
    db.query(query, [nama_item, label_item, gambar_item || "", parsedPrice, parsedDisc, id_kategori || null, desc_item || "", id], (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Menu tidak ditemukan" });
        res.json({ message: "Menu berhasil diupdate" });
    });
});

// DELETE menu (karyawan/admin only)
router.delete("/:id", verifyToken, requireRole("karyawan", "admin"), (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM list_menu WHERE id_menu = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Menu tidak ditemukan" });
        res.json({ message: "Menu berhasil dihapus" });
    });
});

module.exports = router;
