import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyToken } from "../services/jwt";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const token = header.slice("Bearer ".length);
    let payload: { sub: string };

    try {
        payload = verifyToken(token);
    } catch {
        return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, name: true, isActive: true },
    });

    if (!user || !user.isActive) {
        return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    req.user = { id: user.id, email: user.email, name: user.name };
    return next();
}
