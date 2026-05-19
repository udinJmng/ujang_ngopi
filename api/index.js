const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const app = express();
require("dotenv").config();

const getMenuRouter = require("./get_menu/get_menu");
const akunKaryawanRouter = require("./akun_karyawan/akun_karyawan");
const orderHistoryRouter = require("./order_history/order_history");
const tabelKategoriRouter = require("./tabel_kategori/tabel_kategori");
const uploadRouter = require("./upload/upload");
const konfigurasiRouter = require("./konfigurasi/jumlah_kursi");

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
}));

const allowedOrigins = (process.env.ALLOWED_ORIGIN || "http://localhost:3001")
    .split(",")
    .map((o) => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Terlalu banyak request, coba lagi nanti" },
});
app.use(globalLimiter);

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { message: "Terlalu banyak percobaan login, coba lagi nanti" },
});
app.use("/api/akun_karyawan/login", loginLimiter);
app.use("/api/akun_karyawan/admin/login", loginLimiter);

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.get("/", (req, res) => res.send("Ujang Ngopi API is running!"));

app.use("/api/get_menu", getMenuRouter);
app.use("/api/akun_karyawan", akunKaryawanRouter);
app.use("/api/order_history", orderHistoryRouter);
app.use("/api/tabel_kategori", tabelKategoriRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/konfigurasi", konfigurasiRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
});

app.listen(process.env.APP_PORT_LISTEN, () => {
    console.log(`Server jalan di port ${process.env.APP_PORT_LISTEN}`);
});
