import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
    assignOwner,
    changeStatus,
    closeRequest,
    createRequest,
    history,
} from "../controllers/request.controller.js";

const router = Router();

router.post("/", requireAuth, createRequest);
router.post("/:id/assign", requireAuth, assignOwner);
router.post("/:id/status", requireAuth, changeStatus);
router.post("/:id/close", requireAuth, closeRequest);
router.get("/:id/history", requireAuth, history);

export default router;
