const express = require("express");
const router = express.Router();
const db = require("../db/config");

// GET semua menu
router.get("/", (req, res) => {
    const query = `
        SELECT lm.*, tk.nama_kategori 
        FROM list_menu lm
        LEFT JOIN tabel_kategori tk ON lm.id_kategori = tk.id_kategori
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET menu by id
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT lm.*, tk.nama_kategori 
        FROM list_menu lm
        LEFT JOIN tabel_kategori tk ON lm.id_kategori = tk.id_kategori
        WHERE lm.id_menu = ?
    `;
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Menu tidak ditemukan" });
        res.json(results[0]);
    });
});

// GET menu by kategori
router.get("/kategori/:id_kategori", (req, res) => {
    const { id_kategori } = req.params;
    const query = `
        SELECT lm.*, tk.nama_kategori 
        FROM list_menu lm
        LEFT JOIN tabel_kategori tk ON lm.id_kategori = tk.id_kategori
        WHERE lm.id_kategori = ?
    `;
    db.query(query, [id_kategori], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST tambah menu
router.post("/", (req, res) => {
    const { nama_item, label_item, gambar_item, price, disc_perc, id_kategori, desc_item } = req.body;
    if (!nama_item || !label_item || !price)
        return res.status(400).json({ message: "nama_item, label_item, dan price wajib diisi" });

    const query = "INSERT INTO list_menu (nama_item, label_item, gambar_item, price, disc_perc, id_kategori, desc_item) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(query, [nama_item, label_item, gambar_item || "", price, disc_perc || 0, id_kategori || null, desc_item || ""], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Menu berhasil ditambahkan", id_menu: results.insertId });
    });
});

// PUT update menu
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { nama_item, label_item, gambar_item, price, disc_perc, id_kategori, desc_item } = req.body;
    const query = "UPDATE list_menu SET nama_item=?, label_item=?, gambar_item=?, price=?, disc_perc=?, id_kategori=?, desc_item=? WHERE id_menu=?";
    db.query(query, [nama_item, label_item, gambar_item || "", price, disc_perc || 0, id_kategori || null, desc_item || "", id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Menu tidak ditemukan" });
        res.json({ message: "Menu berhasil diupdate" });
    });
});

// DELETE menu
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM list_menu WHERE id_menu = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Menu tidak ditemukan" });
        res.json({ message: "Menu berhasil dihapus" });
    });
});

module.exports = router;
