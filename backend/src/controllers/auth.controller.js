"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.me = me;
exports.listUsers = listUsers;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../lib/prisma");
const auth_schemas_1 = require("../schemas/auth.schemas");
const jwt_1 = require("../services/jwt");
async function login(req, res) {
    const parsed = auth_schemas_1.loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "VALIDATION_ERROR", details: parsed.error.issues });
    }
    const body = parsed.data;
    const user = await prisma_1.prisma.user.findUnique({
        where: { email: body.email },
    });
    if (!user) {
        // eslint-disable-next-line no-console
        console.warn("Login failed: user not found", { email: body.email });
        return res.status(401).json({ error: "INVALID_CREDENTIALS", reason: "USER_NOT_FOUND" });
    }
    if (!user.isActive) {
        // eslint-disable-next-line no-console
        console.warn("Login failed: user inactive", { email: body.email });
        return res.status(401).json({ error: "INVALID_CREDENTIALS", reason: "USER_INACTIVE" });
    }
    const ok = await bcrypt_1.default.compare(body.password, user.password).catch(() => false);
    if (!ok) {
        // eslint-disable-next-line no-console
        console.warn("Login failed: bad password", { email: body.email });
        return res.status(401).json({ error: "INVALID_CREDENTIALS", reason: "BAD_PASSWORD" });
    }
    const token = (0, jwt_1.signToken)(user.id);
    return res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
    });
}
async function me(req, res) {
    return res.json({ user: req.user });
}
async function listUsers(_req, res) {
    const users = await prisma_1.prisma.user.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });
    return res.json({ users });
}
