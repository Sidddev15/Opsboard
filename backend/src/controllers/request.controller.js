"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequest = createRequest;
exports.assignOwner = assignOwner;
exports.changeStatus = changeStatus;
exports.closeRequest = closeRequest;
exports.history = history;
const prisma_1 = require("../lib/prisma");
const request_rules_1 = require("../services/request.rules");
const request_schemas_1 = require("../schemas/request.schemas");
const client_1 = require("@prisma/client");
async function createRequest(req, res) {
    const user = req.user;
    const body = request_schemas_1.createRequestSchema.parse(req.body);
    // OWNER IS ALWAYS THE LOGGED-IN USER
    const ownerId = user.id;
    // verify owner exists & active (logged-in user)
    const owner = await prisma_1.prisma.user.findUnique({
        where: { id: ownerId },
        select: { id: true, isActive: true },
    });
    if (!owner || !owner.isActive) {
        return res.status(400).json({ error: "INVALID_OWNER" });
    }
    const created = await prisma_1.prisma.request.create({
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
                        type: client_1.RequestEventType.CREATED,
                        performedById: user.id,
                    },
                    {
                        type: client_1.RequestEventType.OWNER_ASSIGNED,
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
async function assignOwner(req, res) {
    const user = req.user;
    const id = req.params.id;
    const body = request_schemas_1.assignSchema.parse(req.body);
    const request = await prisma_1.prisma.request.findUnique({ where: { id } });
    if (!request)
        return res.status(404).json({ error: "NOT_FOUND" });
    if (request.status === "DONE")
        return res.status(400).json({ error: "CANNOT_ASSIGN_DONE" });
    const newOwner = await prisma_1.prisma.user.findUnique({
        where: { id: body.ownerId },
        select: { id: true, isActive: true },
    });
    if (!newOwner || !newOwner.isActive)
        return res.status(400).json({ error: "INVALID_OWNER" });
    const updated = await prisma_1.prisma.request.update({
        where: { id },
        data: {
            ownerId: body.ownerId,
            events: {
                create: {
                    type: client_1.RequestEventType.OWNER_ASSIGNED,
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
async function changeStatus(req, res) {
    const user = req.user;
    const id = req.params.id;
    const body = request_schemas_1.statusSchema.parse(req.body);
    const request = await prisma_1.prisma.request.findUnique({ where: { id } });
    if (!request)
        return res.status(404).json({ error: "NOT_FOUND" });
    const from = request.status;
    const to = body.status;
    try {
        (0, request_rules_1.assertTransition)(from, to);
    }
    catch {
        return res.status(400).json({ error: "INVALID_TRANSITION", from, to });
    }
    const updated = await prisma_1.prisma.request.update({
        where: { id },
        data: {
            status: to,
            closedAt: to === "DONE" ? new Date() : request.closedAt,
            events: {
                create: to === "DONE"
                    ? [
                        {
                            type: client_1.RequestEventType.STATUS_CHANGED,
                            fromValue: from,
                            toValue: to,
                            performedById: user.id,
                        },
                        {
                            type: client_1.RequestEventType.CLOSED,
                            fromValue: null,
                            toValue: null,
                            performedById: user.id,
                        },
                    ]
                    : {
                        type: client_1.RequestEventType.STATUS_CHANGED,
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
async function closeRequest(req, res) {
    // semantic wrapper around changeStatus DONE
    req.body = { status: "DONE" };
    return changeStatus(req, res);
}
async function history(req, res) {
    const id = req.params.id;
    const request = await prisma_1.prisma.request.findUnique({
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
    if (!request)
        return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ request });
}
