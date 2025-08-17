import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Polyfill fetch
import "whatwg-fetch";
import { useSearchFetch } from "@/hooks/useSearchFetch";

describe("useSearchFetch", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("sets results + cache flags on success", async () => {
        const payload = {
            page: 1,
            size: 40,
            total: 2,
            results: [
                {
                    id: "1",
                    title: "A",
                    db: "st",
                    thumbnailUrl: "/a.jpg",
                    mediaId: "1",
                    paddedMediaId: "000000001",
                    raw: {},
                },
                {
                    id: "2",
                    title: "B",
                    db: "sp",
                    thumbnailUrl: "/b.jpg",
                    mediaId: "2",
                    paddedMediaId: "000000002",
                    raw: {},
                },
            ],
            _cached: true,
        };

        vi.spyOn(global, "fetch").mockResolvedValueOnce(
            new Response(JSON.stringify(payload), {
                status: 200,
                headers: {
                    "x-cache": "HIT",
                    "content-type": "application/json",
                },
            })
        );

        const { result } = renderHook(() =>
            useSearchFetch({
                q: "cat",
                page: 1,
                size: 40,
                dbFromUrl: [],
                start: undefined,
                end: undefined,
            })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBeNull();
        expect(result.current.results).toHaveLength(2);
        expect(result.current.total).toBe(2);
        expect(result.current.cacheHeader).toBe("HIT");
        expect(result.current.payloadCached).toBe(true);
        expect(result.current.payloadStale).toBe(false);
    });

    it("surfaces error message on non-OK", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce(
            new Response("nope", { status: 500 })
        );

        const { result } = renderHook(() =>
            useSearchFetch({
                q: "oops",
                page: 1,
                size: 40,
                dbFromUrl: [],
                start: undefined,
                end: undefined,
            })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.results).toHaveLength(0);
        expect(result.current.error).toMatch(/Request failed/i);
    });
});
