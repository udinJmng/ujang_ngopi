const express = require("express");
const router = express.Router();
const db = require("../db/config");

// GET jumlah kursi
router.get("/get_kursi", (req, res) => {
    db.query("SELECT VALUE FROM konfigurasi_cabang WHERE nama_konfigurasi = 'jumlah_kursi'", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Konfigurasi tidak ditemukan" });
        res.json(results[0].VALUE);
    });
});

// GET semua konfigurasi
router.get("/", (req, res) => {
    db.query("SELECT * FROM konfigurasi_cabang", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// PUT update konfigurasi by nama
router.put("/:nama", (req, res) => {
    const { nama } = req.params;
    const { value } = req.body;
    if (value === undefined || value === null)
        return res.status(400).json({ message: "Value wajib diisi" });
    db.query(
        "UPDATE konfigurasi_cabang SET VALUE = ? WHERE nama_konfigurasi = ?",
        [value, nama],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.affectedRows === 0) return res.status(404).json({ message: "Konfigurasi tidak ditemukan" });
            res.json({ message: "Konfigurasi berhasil diupdate" });
        }
    );
});

module.exports = router;
