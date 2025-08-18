export function cacheHitHeaders(): Headers {
    const headers = new Headers();
    headers.set("x-cache", "HIT");
    headers.set("cache-control", "no-store");
    return headers;
}

export function cacheMissHeaders(): Headers {
    const headers = new Headers();
    headers.set("x-cache", "MISS");
    headers.set("cache-control", "no-store");
    return headers;
}

export function cacheStaleHeaders(errorMessage: string): Headers {
    const headers = new Headers();
    headers.set("x-cache", "STALE");
    headers.set("cache-control", "no-store");
    headers.set("x-error", errorMessage);
    return headers;
}
