import { API_BASE_URL } from "./config";

export class HttpError extends Error {
    status: number;
    body: any;
    constructor(status: number, body: any) {
        super(body?.error || "HTTP_ERROR");
        this.status = status;
        this.body = body;
    }
}

export async function apiFetch<T>(
    path: string,
    opts: { method?: string; token?: string | null; body?: any } = {}
): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: opts.method ?? "GET",
        headers: {
            "Content-Type": "application/json",
            ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) throw new HttpError(res.status, data);
    return data as T;
}
