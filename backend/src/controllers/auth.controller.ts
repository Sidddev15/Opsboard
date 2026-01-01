import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { loginSchema } from "../schemas/auth.schemas.js";
import { signToken } from "../services/jwt.js";

export async function login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "VALIDATION_ERROR", details: parsed.error.issues });
    }
    const body = parsed.data;

    const user = await prisma.user.findUnique({
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

    const ok = await bcrypt.compare(body.password, user.password).catch(() => false);
    if (!ok) {
        // eslint-disable-next-line no-console
        console.warn("Login failed: bad password", { email: body.email });
        return res.status(401).json({ error: "INVALID_CREDENTIALS", reason: "BAD_PASSWORD" });
    }

    const token = signToken(user.id);

    return res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
    });
}

export async function me(req: Request, res: Response) {
    return res.json({ user: req.user });
}
