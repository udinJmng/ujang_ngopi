const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "../public/uploads")),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    allowed.includes(file.mimetype)
        ? cb(null, true)
        : cb(new Error("Hanya file gambar yang diizinkan (jpg, png, webp, gif)"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// POST upload gambar
router.post("/", upload.single("gambar"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Tidak ada file yang diupload" });
    res.json({ message: "Upload berhasil", url: `/uploads/${req.file.filename}` });
});

module.exports = router;
