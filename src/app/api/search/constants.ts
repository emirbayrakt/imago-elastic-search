export const INDEX = process.env.IMAGO_INDEX || "imago";
export const BASE_URL =
    process.env.IMAGO_BASE_URL || "https://www.imago-images.de";
export const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 3600); // 1h default
