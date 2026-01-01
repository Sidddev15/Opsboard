import { Router } from "express";
import { login, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

router.post("/login", asyncHandler(login));
router.get("/me", asyncHandler(requireAuth), asyncHandler(me));

export default router;
