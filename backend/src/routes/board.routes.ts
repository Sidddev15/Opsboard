import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { getBoard } from "../controllers/board.controller";
import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

router.get("/", asyncHandler(requireAuth), asyncHandler(getBoard));

export default router;
