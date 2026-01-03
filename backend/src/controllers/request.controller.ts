import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { assertTransition } from "../services/request.rules";
import { assignSchema, createRequestSchema, statusSchema } from "../schemas/request.schemas";
import { RequestEventType, RequestStatus } from "@prisma/client";

export async function createRequest(req: Request, res: Response) {
    const user = req.user!;
    const body = createRequestSchema.parse(req.body);

    // Owner defaults to the logged-in user unless explicitly provided
    const ownerId = body.ownerId ?? user.id;

    // verify owner exists & is active
    const owner = await prisma.user.findUnique({
        where: { id: ownerId },
        select: { id: true, isActive: true },
    });
    if (!owner || !owner.isActive) {
        return res.status(400).json({ error: "INVALID_OWNER" });
    }

    const created = await prisma.request.create({
        data: {
            type: body.type,
            description: body.description,
            urgency: body.urgency,
            location: body.location,
            requestedBy: body.requestedBy,
            status: "NEW",

            // 🔑 FIX HERE
            ownerId: ownerId,
            createdById: user.id,

            events: {
                create: [
                    {
                        type: RequestEventType.CREATED,
                        performedById: user.id,
                    },
                    {
                        type: RequestEventType.OWNER_ASSIGNED,
                        fromValue: null,
                        toValue: ownerId,
                        performedById: user.id,
                    },
                ],
            },
        },
        include: { owner: { select: { id: true, name: true } } },
    });

    return res.status(201).json({ request: created });
}


export async function assignOwner(req: Request, res: Response) {
    const user = req.user!;
    const id = req.params.id;
    const body = assignSchema.parse(req.body);

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: "NOT_FOUND" });
    if (request.status === "DONE") return res.status(400).json({ error: "CANNOT_ASSIGN_DONE" });

    const newOwner = await prisma.user.findUnique({
        where: { id: body.ownerId },
        select: { id: true, isActive: true },
    });
    if (!newOwner || !newOwner.isActive) return res.status(400).json({ error: "INVALID_OWNER" });

    const updated = await prisma.request.update({
        where: { id },
        data: {
            ownerId: body.ownerId,
            events: {
                create: {
                    type: RequestEventType.OWNER_ASSIGNED,
                    fromValue: request.ownerId,
                    toValue: body.ownerId,
                    performedById: user.id,
                },
            },
        },
        include: { owner: { select: { id: true, name: true } } },
    });

    return res.json({ request: updated });
}

export async function changeStatus(req: Request, res: Response) {
    const user = req.user!;
    const id = req.params.id;
    const body = statusSchema.parse(req.body);

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: "NOT_FOUND" });

    const from = request.status;
    const to = body.status as RequestStatus;

    try {
        assertTransition(from, to);
    } catch {
        return res.status(400).json({ error: "INVALID_TRANSITION", from, to });
    }

    const updated = await prisma.request.update({
        where: { id },
        data: {
            status: to,
            closedAt: to === "DONE" ? new Date() : request.closedAt,
            events: {
                create:
                    to === "DONE"
                        ? [
                            {
                                type: RequestEventType.STATUS_CHANGED,
                                fromValue: from,
                                toValue: to,
                                performedById: user.id,
                            },
                            {
                                type: RequestEventType.CLOSED,
                                fromValue: null,
                                toValue: null,
                                performedById: user.id,
                            },
                        ]
                        : {
                            type: RequestEventType.STATUS_CHANGED,
                            fromValue: from,
                            toValue: to,
                            performedById: user.id,
                        },
            },
        },
        include: { owner: { select: { id: true, name: true } } },
    });

    return res.json({ request: updated });
}

export async function closeRequest(req: Request, res: Response) {
    // semantic wrapper around changeStatus DONE
    req.body = { status: "DONE" };
    return changeStatus(req, res);
}

export async function history(req: Request, res: Response) {
    const id = req.params.id;

    const request = await prisma.request.findUnique({
        where: { id },
        include: {
            events: {
                orderBy: { createdAt: "asc" },
                include: { performedBy: { select: { id: true, name: true } } },
            },
            owner: { select: { id: true, name: true } },
            createdBy: { select: { id: true, name: true } },
        },
    });

    if (!request) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ request });
}
