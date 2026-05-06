const express = require("express");
const router = express.Router();
const db = require("../db/config");

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
    const { data_order, pay_via, status } = req.body;
    if (!pay_via || !status)
        return res.status(400).json({ message: "pay_via dan status wajib diisi" });

    db.query(
        "INSERT INTO order_history (data_order, pay_via, status) VALUES (?, ?, ?)",
        [JSON.stringify(data_order || []), pay_via, status],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Order berhasil dibuat", id: results.insertId });
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
