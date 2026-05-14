const express = require("express");
const router = express.Router();
const db = require("../db/config");

// Buat generate TransID
function genTransactionCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    let concat = "PAYMENT-" + result;
    return concat;
}

// GET semua order
router.get("/", (req, res) => {
    db.query("SELECT * FROM order_history", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET order by id
router.get("/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM order_history WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Order tidak ditemukan" });
        res.json(results[0]);
    });
});

// POST buat order baru
router.post("/", (req, res) => {
    const { data_order, pay_via, status, no_meja, total_pay } = req.body;
    const TransID = genTransactionCode(10);
    if (!pay_via || !status)
        return res.status(400).json({ message: "pay_via dan status wajib diisi" });

    db.query(
        "INSERT INTO order_history (data_order, pay_via, status, payment_refcode, no_meja, total_pay) VALUES (?, ?, ?, ?, ?, ?)",
        [JSON.stringify(data_order || []), pay_via, status, TransID, no_meja || null, total_pay || null],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Order berhasil dibuat", id: results.insertId, payment_refcode: TransID });
        }
    );
});

// PUT update status order
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status wajib diisi" });
    db.query("UPDATE order_history SET status = ? WHERE id = ?", [status, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Order tidak ditemukan" });
        res.json({ message: "Status order berhasil diupdate" });
    });
});

module.exports = router;
