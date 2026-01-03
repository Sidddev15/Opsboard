"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBoard = getBoard;
const prisma_1 = require("../lib/prisma");
const urgencyRank = { NOW: 0, TODAY: 1, LOW: 2 };
async function getBoard(_req, res) {
    const items = await prisma_1.prisma.request.findMany({
        where: { NOT: { status: "DONE" } },
        include: { owner: { select: { id: true, name: true } } },
    });
    items.sort((a, b) => {
        const ua = urgencyRank[a.urgency];
        const ub = urgencyRank[b.urgency];
        if (ua !== ub)
            return ua - ub;
        return a.createdAt.getTime() - b.createdAt.getTime();
    });
    return res.json({
        requests: items.map((r) => ({
            id: r.id,
            type: r.type,
            description: r.description,
            urgency: r.urgency,
            location: r.location,
            requestedBy: r.requestedBy,
            status: r.status,
            owner: r.owner,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
        })),
    });
}
