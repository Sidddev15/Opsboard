export function hhmm(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

export function urgencyStyle(u: "NOW" | "TODAY" | "LOW", status?: string) {
    if (status === "WAITING") {
        return { background: "rgba(255,255,0,0.08)" }; // yellow tint = blocked
    }
    if (u === "NOW") return { background: "rgba(255,0,0,0.12)" };
    if (u === "TODAY") return { background: "rgba(255,165,0,0.12)" };
    return { background: "rgba(255,255,255,0.03)" };
}

