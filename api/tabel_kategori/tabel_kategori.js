const express = require("express");
const router = express.Router();
const db = require("../db/config");

// GET semua kategori
router.get("/", (req, res) => {
    db.query("SELECT * FROM tabel_kategori", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET kategori by id
router.get("/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM tabel_kategori WHERE id_kategori = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Kategori tidak ditemukan" });
        res.json(results[0]);
    });
});

// POST tambah kategori
router.post("/", (req, res) => {
    const { nama_kategori } = req.body;
    if (!nama_kategori) return res.status(400).json({ message: "Nama kategori wajib diisi" });
    db.query("INSERT INTO tabel_kategori (nama_kategori) VALUES (?)", [nama_kategori], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Kategori berhasil ditambahkan", id_kategori: results.insertId });
    });
});

// PUT update kategori
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { nama_kategori } = req.body;
    if (!nama_kategori) return res.status(400).json({ message: "Nama kategori wajib diisi" });
    db.query("UPDATE tabel_kategori SET nama_kategori=? WHERE id_kategori=?", [nama_kategori, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Kategori tidak ditemukan" });
        res.json({ message: "Kategori berhasil diupdate" });
    });
});

// DELETE kategori
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM tabel_kategori WHERE id_kategori = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Kategori tidak ditemukan" });
        res.json({ message: "Kategori berhasil dihapus" });
    });
});

module.exports = router;
