import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getBoard } from "../controllers/board.controller.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(requireAuth), asyncHandler(getBoard));

export default router;
