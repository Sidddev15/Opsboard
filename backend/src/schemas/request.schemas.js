"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusSchema = exports.statusEnum = exports.assignSchema = exports.createRequestSchema = exports.urgencyEnum = exports.requestTypeEnum = void 0;
const zod_1 = require("zod");
exports.requestTypeEnum = zod_1.z.enum([
    "TRANSPORT",
    "FORKLIFT",
    "PACKING_HELP",
    "URGENT_PURCHASE",
    "MACHINE_ISSUE",
    "LABOUR_REQUIREMENT",
    "OTHER",
]);
exports.urgencyEnum = zod_1.z.enum(["LOW", "TODAY", "NOW"]);
exports.createRequestSchema = zod_1.z.object({
    type: exports.requestTypeEnum,
    description: zod_1.z.string().min(3).max(200),
    urgency: exports.urgencyEnum,
    location: zod_1.z.string().min(2).max(80),
    requestedBy: zod_1.z.string().min(2).max(60),
    ownerId: zod_1.z.string().uuid(),
});
exports.assignSchema = zod_1.z.object({
    ownerId: zod_1.z.string().uuid(),
});
exports.statusEnum = zod_1.z.enum(["NEW", "IN_PROGRESS", "WAITING", "DONE"]);
exports.statusSchema = zod_1.z.object({
    status: exports.statusEnum,
});
