import express from "express";
import cors from "cors";
import { env } from "./lib/env.js";
import { errorHandler } from "./middlewares/error.js";

import authRoutes from "./routes/auth.routes.js";
import requestRoutes from "./routes/request.routes.js";
import boardRoutes from "./routes/board.routes.js";

export const app = express();

app.use(
    cors({
        origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/requests", requestRoutes);
app.use("/board", boardRoutes);

app.use(errorHandler);
