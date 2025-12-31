import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { loginSchema } from "../schemas/auth.schemas.js";
import { signToken } from "../services/jwt.js";

export async function login(req: Request, res: Response) {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
        where: { email: body.email },
    });

    if (!user || !user.isActive) {
        return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    const ok = await bcrypt.compare(body.password, user.password);
    if (!ok) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

    const token = signToken(user.id);

    return res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
    });
}

export async function me(req: Request, res: Response) {
    return res.json({ user: req.user });
}
