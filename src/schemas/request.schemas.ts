import { z } from "zod";

export const requestTypeEnum = z.enum([
    "TRANSPORT",
    "FORKLIFT",
    "PACKING_HELP",
    "URGENT_PURCHASE",
    "MACHINE_ISSUE",
    "LABOUR_REQUIREMENT",
    "OTHER",
]);

export const urgencyEnum = z.enum(["LOW", "TODAY", "NOW"]);

export const createRequestSchema = z.object({
    type: requestTypeEnum,
    description: z.string().min(3).max(200),
    urgency: urgencyEnum,
    location: z.string().min(2).max(80),
    requestedBy: z.string().min(2).max(60),
    ownerId: z.string().uuid(),
});

export const assignSchema = z.object({
    ownerId: z.string().uuid(),
});

export const statusEnum = z.enum(["NEW", "IN_PROGRESS", "WAITING", "DONE"]);

export const statusSchema = z.object({
    status: statusEnum,
});
