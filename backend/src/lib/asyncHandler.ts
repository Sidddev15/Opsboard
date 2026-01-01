import type { RequestHandler } from "express";

// Wrap async route handlers so thrown errors reach the global error handler.
export function asyncHandler(fn: RequestHandler): RequestHandler {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
