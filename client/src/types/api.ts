export type User = { id: string; email: string; name: string };

export type RequestType =
    | "TRANSPORT"
    | "FORKLIFT"
    | "PACKING_HELP"
    | "URGENT_PURCHASE"
    | "MACHINE_ISSUE"
    | "LABOUR_REQUIREMENT"
    | "OTHER";

export type UrgencyLevel = "LOW" | "TODAY" | "NOW";
export type RequestStatus = "NEW" | "IN_PROGRESS" | "WAITING" | "DONE";

export type Owner = { id: string; name: string };

export type BoardRequest = {
    id: string;
    type: RequestType;
    description: string;
    urgency: UrgencyLevel;
    location: string;
    requestedBy: string;
    status: RequestStatus;
    owner: Owner;
    createdAt: string;
    updatedAt: string;
};

export type BoardResponse = { requests: BoardRequest[] };

export type LoginResponse = { token: string; user: User };
export type MeResponse = { user: User };
