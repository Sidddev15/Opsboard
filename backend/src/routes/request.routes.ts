import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
    assignOwner,
    changeStatus,
    closeRequest,
    createRequest,
    history,
} from "../controllers/request.controller.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(requireAuth), asyncHandler(createRequest));
router.post("/:id/assign", asyncHandler(requireAuth), asyncHandler(assignOwner));
router.post("/:id/status", asyncHandler(requireAuth), asyncHandler(changeStatus));
router.post("/:id/close", asyncHandler(requireAuth), asyncHandler(closeRequest));
router.get("/:id/history", asyncHandler(requireAuth), asyncHandler(history));

export default router;
