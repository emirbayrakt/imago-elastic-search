import Redis, { RedisOptions } from "ioredis";

const url = process.env.REDIS_URL;

/**
 * Make Redis optional & quiet when unavailable:
 * - lazyConnect: don't connect until we ask
 * - retryStrategy: no auto-retries (return null)
 * - reconnectOnError: never reconnect on errors
 * - enableOfflineQueue: false -> commands fail immediately if not connected
 * - enableReadyCheck: false -> don't wait for INFO/READY
 * - maxRetriesPerRequest: 0 -> don't retry a command
 * - connectTimeout: short guard so connect() doesn't hang long
 */
const opts: RedisOptions = {
    lazyConnect: true,
    retryStrategy: () => null,
    reconnectOnError: () => false,
    enableOfflineQueue: false,
    enableReadyCheck: false,
    maxRetriesPerRequest: 0,
    connectTimeout: 800,
};

if (!url) {
    // Don’t crash in local dev if unset; just run without cache.
    console.warn("[redis] REDIS_URL not set; caching disabled.");
}

export const redis = url ? new Redis(url, opts) : null;

// Prevent “Unhandled error event” noise when Redis is down.
if (redis) {
    let loggedOnce = false;
    redis.on("error", (err) => {
        if (!loggedOnce) {
            loggedOnce = true;
            // Log one line once; keep silent afterwards to avoid spam.
            console.warn(
                "[redis] disabled (cannot connect):",
                err?.message || err
            );
        }
    });
}

/** Pings on first use; safe to call repeatedly. Returns true if usable. */
export async function ensureRedis(): Promise<boolean> {
    if (!redis) return false;
    try {
        // Connect only when we deliberately ask to.
        if (
            redis.status === "end" ||
            redis.status === "wait" ||
            redis.status === "close"
        ) {
            await redis.connect();
        } else if (redis.status !== "ready" && redis.status !== "connecting") {
            await redis.connect();
        }

        // Quick liveness check (will throw if not connected).
        await redis.ping();
        return true;
    } catch {
        // If connect/ping failed, don't keep retrying—leave it “optional”.
        return false;
    }
}
