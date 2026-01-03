"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertTransition = assertTransition;
const allowed = {
    NEW: ["IN_PROGRESS", "WAITING"],
    IN_PROGRESS: ["WAITING", "DONE"],
    WAITING: ["IN_PROGRESS", "DONE"],
    DONE: [],
};
function assertTransition(from, to) {
    if (!allowed[from].includes(to)) {
        throw new Error(`Invalid status transition: ${from} -> ${to}`);
    }
}
