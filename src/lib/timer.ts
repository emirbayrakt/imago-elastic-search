export interface TimedError extends Error {
    __elapsedMs?: number;
}

export async function time<T>(
    label: string,
    fn: () => Promise<T>
): Promise<{ res: T; ms: number }> {
    const start = performance.now();
    try {
        const res = await fn();
        return { res, ms: performance.now() - start };
    } catch (e: unknown) {
        const ms = performance.now() - start;

        // Attach elapsed time if it's an Error object
        if (e instanceof Error) {
            (e as TimedError).__elapsedMs = ms;
            throw e;
        }

        // If it's not an Error (could be a string, etc.), wrap it
        const wrapped: TimedError = new Error(String(e));
        wrapped.__elapsedMs = ms;
        throw wrapped;
    }
}
