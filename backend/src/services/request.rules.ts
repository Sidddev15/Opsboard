import { RequestStatus } from "@prisma/client";

const allowed: Record<RequestStatus, RequestStatus[]> = {
    NEW: ["IN_PROGRESS", "WAITING"],
    IN_PROGRESS: ["WAITING", "DONE"],
    WAITING: ["IN_PROGRESS", "DONE"],
    DONE: [],
};

export function assertTransition(from: RequestStatus, to: RequestStatus) {
    if (!allowed[from].includes(to)) {
        throw new Error(`Invalid status transition: ${from} -> ${to}`);
    }
}
