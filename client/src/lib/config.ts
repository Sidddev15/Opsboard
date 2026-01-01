export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const EDITOR_EMAILS: string[] = String(import.meta.env.VITE_EDITOR_EMAILS || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
