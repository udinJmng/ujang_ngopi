const mysql = require("mysql");
require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.CABANG_TENANT + "_" +process.env.DB_NAME,
    port: process.env.DB_PORT,
    password : process.env.DB_PASSWORD
});

db.connect((err) => {
    console.log(process.env.CABANG_TENANT + "_" +process.env.DB_NAME)
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }
    console.log("Connected to MySQL database");
});

module.exports = db;
