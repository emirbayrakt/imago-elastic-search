export const toLarge = (thumb: string) => thumb.replace(/\/s\.jpg$/i, "/w.jpg");
export const toThumb = (url: string) => url.replace(/\/w\.jpg$/i, "/s.jpg");

export function toNum(v: unknown): number | undefined {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
        const n = Number(v);
        if (Number.isFinite(n)) return n;
    }
    return undefined;
}

export function humanAspect(w?: number, h?: number) {
    if (!w || !h) return "";
    const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
    const g = gcd(w, h);
    return `${Math.round(w / g)}:${Math.round(h / g)}`;
}
