const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/config");
const { verifyToken, requireRole } = require("../middleware/auth");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// GET semua karyawan
router.get("/", verifyToken, requireRole("admin"), (req, res) => {
    db.query("SELECT id, fName, lName, username_login, avatar_url FROM akun_karyawan", (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        res.json(results);
    });
});

// GET karyawan by id
router.get("/:id", verifyToken, requireRole("admin"), (req, res) => {
    const { id } = req.params;
    db.query("SELECT id, fName, lName, username_login, avatar_url FROM akun_karyawan WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        if (results.length === 0) return res.status(404).json({ message: "Karyawan tidak ditemukan" });
        res.json(results[0]);
    });
});

// POST login karyawan
router.post("/login", async (req, res) => {
    const { username_login, password_login } = req.body;
    if (!username_login || !password_login)
        return res.status(400).json({ message: "Username dan password wajib diisi" });

    db.query("SELECT * FROM akun_karyawan WHERE username_login = ?", [username_login], async (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        if (results.length === 0)
            return res.status(401).json({ message: "Username atau password salah" });

        const karyawan = results[0];
        const match = await bcrypt.compare(password_login, karyawan.password_login);
        if (!match)
            return res.status(401).json({ message: "Username atau password salah" });

        const { password_login: _, ...safeData } = karyawan;
        const token = jwt.sign({ id: karyawan.id, role: "karyawan" }, JWT_SECRET, { expiresIn: "8h" });
        res.json({ message: "Login berhasil", token, data: safeData });
    });
});

// POST login admin
router.post("/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "Username dan password wajib diisi" });

    const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin123";
    if (username !== ADMIN_USER || password !== ADMIN_PASS)
        return res.status(401).json({ message: "Username atau password salah" });

    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ message: "Login admin berhasil", token, role: "admin" });
});

// POST buat akun karyawan baru
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
    const { fName, lName, username_login, password_login, avatar_url } = req.body;
    if (!fName || !lName || !username_login || !password_login)
        return res.status(400).json({ message: "Semua field wajib diisi" });

    try {
        const hashed = await bcrypt.hash(password_login, SALT_ROUNDS);
        db.query(
            "INSERT INTO akun_karyawan (fName, lName, username_login, password_login, avatar_url) VALUES (?, ?, ?, ?, ?)",
            [fName, lName, username_login, hashed, avatar_url || ""],
            (err) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY")
                        return res.status(409).json({ message: "Username sudah digunakan" });
                    return res.status(500).json({ error: "Terjadi kesalahan server" });
                }
                res.status(201).json({ message: "Akun karyawan berhasil dibuat" });
            }
        );
    } catch {
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
});

// PUT update karyawan
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
    const { id } = req.params;
    const { fName, lName, username_login, password_login, avatar_url } = req.body;

    try {
        let finalPassword;
        if (password_login && password_login.trim() !== "") {
            finalPassword = await bcrypt.hash(password_login, SALT_ROUNDS);
        } else {
            const [existing] = await new Promise((resolve, reject) =>
                db.query("SELECT password_login FROM akun_karyawan WHERE id = ?", [id], (err, rows) =>
                    err ? reject(err) : resolve(rows)
                )
            );
            if (!existing) return res.status(404).json({ message: "Karyawan tidak ditemukan" });
            finalPassword = existing.password_login;
        }

        db.query(
            "UPDATE akun_karyawan SET fName=?, lName=?, username_login=?, password_login=?, avatar_url=? WHERE id=?",
            [fName, lName, username_login, finalPassword, avatar_url || "", id],
            (err, results) => {
                if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
                if (results.affectedRows === 0) return res.status(404).json({ message: "Karyawan tidak ditemukan" });
                res.json({ message: "Data karyawan berhasil diupdate" });
            }
        );
    } catch {
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
});

// DELETE karyawan
router.delete("/:id", verifyToken, requireRole("admin"), (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM akun_karyawan WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Karyawan tidak ditemukan" });
        res.json({ message: "Akun karyawan berhasil dihapus" });
    });
});

module.exports = router;
