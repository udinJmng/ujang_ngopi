const express = require("express");
const router = express.Router();
const db = require("../db/config");


router.get("/get_kursi", (req, res) => {
    const kursi = "jumlah_kursi";
    db.query("SELECT VALUE FROM konfigurasi_cabang WHERE nama_konfigurasi = ?", [kursi], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Jumlah kursi tidak ditemukan" });
        res.json(results[0].VALUE);
    });
});

module.exports = router;
