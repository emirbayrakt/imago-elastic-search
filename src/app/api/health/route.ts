import { NextResponse } from "next/server";
import { ensureRedis, redis } from "@/lib/redis";
import { es } from "@/lib/es";

export async function GET() {
    const checks: Record<string, "UP" | "DOWN"> = {};

    // Redis
    try {
        const ok = await ensureRedis();
        if (ok && redis) {
            await redis.ping();
            checks.redis = "UP";
        } else {
            checks.redis = "DOWN";
        }
    } catch {
        checks.redis = "DOWN";
    }

    // ES
    try {
        await es.ping();
        checks.elasticsearch = "UP";
    } catch {
        checks.elasticsearch = "DOWN";
    }

    const allUp = Object.values(checks).every((v) => v === "UP");
    return NextResponse.json(
        { status: allUp ? "UP" : "DOWN", checks },
        { status: allUp ? 200 : 503 }
    );
}
