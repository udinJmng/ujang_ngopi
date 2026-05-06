const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config();

const getMenuRouter = require("./get_menu/get_menu");
const akunKaryawanRouter = require("./akun_karyawan/akun_karyawan");
const orderHistoryRouter = require("./order_history/order_history");
const tabelKategoriRouter = require("./tabel_kategori/tabel_kategori");
const uploadRouter = require("./upload/upload");

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.get("/", (req, res) => res.send("Ujang Ngopi API is running!"));

app.use("/api/get_menu", getMenuRouter);
app.use("/api/akun_karyawan", akunKaryawanRouter);
app.use("/api/order_history", orderHistoryRouter);
app.use("/api/tabel_kategori", tabelKategoriRouter);
app.use("/api/upload", uploadRouter);

app.listen(process.env.APP_PORT_LISTEN, () => {
    console.log(`Server jalan di port ${process.env.APP_PORT_LISTEN}`);
});
