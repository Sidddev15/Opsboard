export function hhmm(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function urgencyStyle(u: "NOW" | "TODAY" | "LOW") {
    if (u === "NOW") return { background: "rgba(255,0,0,0.12)" };
    if (u === "TODAY") return { background: "rgba(255,165,0,0.12)" };
    return { background: "rgba(255,255,255,0.03)" };
}
