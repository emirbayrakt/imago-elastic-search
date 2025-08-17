import Redis, { RedisOptions } from "ioredis";

let redis: Redis | null = null;
let loggedOnce = false;

const opts: RedisOptions = {
    lazyConnect: true,
    retryStrategy: () => null,
    reconnectOnError: () => false,
    enableOfflineQueue: false,
    enableReadyCheck: false,
    maxRetriesPerRequest: 0,
    connectTimeout: 800,
};

/** Pings on first use; safe to call repeatedly. Returns true if usable. */
export async function ensureRedis(): Promise<boolean> {
    const url = process.env.REDIS_URL;
    if (!url) return false; // quiet if unset (e.g., at build time)

    if (!redis) {
        redis = new Redis(url, opts);
        redis.on("error", (err) => {
            if (!loggedOnce) {
                loggedOnce = true;
                console.warn("[redis] client error:", err?.message || err);
            }
        });
    }

    try {
        if (
            redis.status === "end" ||
            redis.status === "wait" ||
            redis.status === "close"
        ) {
            await redis.connect();
        } else if (redis.status !== "ready" && redis.status !== "connecting") {
            await redis.connect();
        }

        await redis.ping();
        return true;
    } catch {
        return false;
    }
}

/** Thin helpers that no-op if not connected. */
export const redisHelper = {
    get: async (k: string) => (redis?.status === "ready" ? redis.get(k) : null),
    set: async (...args: Parameters<Redis["set"]>) =>
        redis?.status === "ready" ? redis.set(...args) : null,
};

// Back-compat export name if your routes import { redis }
export { redis };
