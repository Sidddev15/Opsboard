"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const prisma_1 = require("../lib/prisma");
const jwt_1 = require("../services/jwt");
async function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "UNAUTHORIZED" });
    }
    const token = header.slice("Bearer ".length);
    let payload;
    try {
        payload = (0, jwt_1.verifyToken)(token);
    }
    catch {
        return res.status(401).json({ error: "UNAUTHORIZED" });
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, name: true, isActive: true },
    });
    if (!user || !user.isActive) {
        return res.status(401).json({ error: "UNAUTHORIZED" });
    }
    req.user = { id: user.id, email: user.email, name: user.name };
    return next();
}
