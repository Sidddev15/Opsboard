"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_1 = require("./middlewares/error");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const request_routes_1 = __importDefault(require("./routes/request.routes"));
const board_routes_1 = __importDefault(require("./routes/board.routes"));
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'https://opsboard-client.vercel.app',
    ],
    credentials: true,
}));
exports.app.use(express_1.default.json({ limit: "1mb" }));
exports.app.get("/health", (_req, res) => res.json({ ok: true }));
exports.app.use("/auth", auth_routes_1.default);
exports.app.use("/requests", request_routes_1.default);
exports.app.use("/board", board_routes_1.default);
exports.app.use(error_1.errorHandler);
