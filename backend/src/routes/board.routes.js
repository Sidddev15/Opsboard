"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const board_controller_1 = require("../controllers/board.controller");
const asyncHandler_1 = require("../lib/asyncHandler");
const router = (0, express_1.Router)();
router.get("/", (0, asyncHandler_1.asyncHandler)(auth_1.requireAuth), (0, asyncHandler_1.asyncHandler)(board_controller_1.getBoard));
exports.default = router;
