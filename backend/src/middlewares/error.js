"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function errorHandler(err, _req, res, _next) {
    // eslint-disable-next-line no-console
    console.error(err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            details: err.issues,
        });
    }
    if (err instanceof Error) {
        return res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
    }
    return res.status(500).json({ error: "INTERNAL_ERROR" });
}
