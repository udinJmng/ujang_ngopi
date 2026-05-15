const express = require("express");
const router = express.Router();
const db = require("../db/config");
const { verifyToken, requireRole } = require("../middleware/auth");

const VALID_PAY_VIA = ["cash", "qris"];
const VALID_STATUS = ["sukses", "proses"];

function genTransactionCode(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++)
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    return "PAYMENT-" + result;
}

// GET semua order (karyawan/admin only)
router.get("/", verifyToken, requireRole("karyawan", "admin"), (req, res) => {
    db.query("SELECT * FROM order_history ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        res.json(results);
    });
});

// GET order by id (karyawan/admin only)
router.get("/:id", verifyToken, requireRole("karyawan", "admin"), (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM order_history WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        if (results.length === 0) return res.status(404).json({ message: "Order tidak ditemukan" });
        res.json(results[0]);
    });
});

// POST buat order baru (public — customer bisa order)
router.post("/", (req, res) => {
    const { data_order, pay_via, status, no_meja, total_pay } = req.body;

    if (!pay_via || !VALID_PAY_VIA.includes(pay_via))
        return res.status(400).json({ message: "pay_via harus 'cash' atau 'qris'" });
    if (!status || !VALID_STATUS.includes(status))
        return res.status(400).json({ message: "status harus 'sukses' atau 'proses'" });
    if (!Array.isArray(data_order) || data_order.length === 0)
        return res.status(400).json({ message: "data_order tidak boleh kosong" });

    const TransID = genTransactionCode(10);
    db.query(
        "INSERT INTO order_history (data_order, pay_via, status, payment_refcode, no_meja, total_pay) VALUES (?, ?, ?, ?, ?, ?)",
        [JSON.stringify(data_order), pay_via, status, TransID, no_meja || null, total_pay || null],
        (err, results) => {
            if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
            res.status(201).json({ message: "Order berhasil dibuat", id: results.insertId, payment_refcode: TransID });
        }
    );
});

// PUT update status order (karyawan/admin only)
router.put("/:id", verifyToken, requireRole("karyawan", "admin"), (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !VALID_STATUS.includes(status))
        return res.status(400).json({ message: "status harus 'sukses' atau 'proses'" });

    db.query("UPDATE order_history SET status = ? WHERE id = ?", [status, id], (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Order tidak ditemukan" });
        res.json({ message: "Status order berhasil diupdate" });
    });
});

module.exports = router;
