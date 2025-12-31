import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getBoard } from "../controllers/board.controller.js";

const router = Router();

router.get("/", requireAuth, getBoard);

export default router;
