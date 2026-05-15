const express = require("express");
const router = express.Router();
const db = require("../db/config");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET jumlah kursi (public — dipakai App.js untuk validasi meja)
router.get("/get_kursi", (req, res) => {
    db.query("SELECT VALUE FROM konfigurasi_cabang WHERE nama_konfigurasi = 'jumlah_kursi'", (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        if (results.length === 0) return res.status(404).json({ message: "Konfigurasi tidak ditemukan" });
        res.json(results[0].VALUE);
    });
});

// GET semua konfigurasi (karyawan/admin only)
router.get("/", verifyToken, requireRole("karyawan", "admin"), (req, res) => {
    db.query("SELECT * FROM konfigurasi_cabang", (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        res.json(results);
    });
});

// PUT update konfigurasi (karyawan/admin only)
router.put("/:nama", verifyToken, requireRole("karyawan", "admin"), (req, res) => {
    const { nama } = req.params;
    const { value } = req.body;
    if (value === undefined || value === null)
        return res.status(400).json({ message: "Value wajib diisi" });

    const parsed = parseInt(value);
    if (isNaN(parsed) || parsed < 1)
        return res.status(400).json({ message: "Value harus angka positif" });

    db.query(
        "UPDATE konfigurasi_cabang SET VALUE = ? WHERE nama_konfigurasi = ?",
        [parsed, nama],
        (err, results) => {
            if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
            if (results.affectedRows === 0) return res.status(404).json({ message: "Konfigurasi tidak ditemukan" });
            res.json({ message: "Konfigurasi berhasil diupdate" });
        }
    );
});

module.exports = router;
