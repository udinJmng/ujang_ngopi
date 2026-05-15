const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

function verifyToken(req, res, next) {
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer "))
        return res.status(401).json({ message: "Akses ditolak, token tidak ada" });

    const token = header.split(" ")[1];
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: "Token tidak valid atau sudah expired" });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role))
            return res.status(403).json({ message: "Tidak punya akses" });
        next();
    };
}

module.exports = { verifyToken, requireRole };
