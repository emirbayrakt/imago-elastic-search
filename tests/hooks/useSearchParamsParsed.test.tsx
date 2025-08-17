declare module "next/navigation" {
    export const __setSearch: (s: string) => void;
    export const __getRouterFns: () => { push: Mock; replace: Mock };
}
import { describe, it, expect, beforeEach, Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";

// --- Hoisted state & fns used by the mock (so hoisting won't break)
const h = vi.hoisted(() => ({
    state: {
        search: "?q=cat&page=2&size=40&db=st,sp&start=2020-01-01&end=2020-12-31",
    },
    push: vi.fn(),
    replace: vi.fn(),
}));

// Mock next/navigation using hoisted state
vi.mock("next/navigation", () => {
    return {
        useRouter: () => ({ push: h.push, replace: h.replace }),
        usePathname: () => "/",
        useSearchParams: () => new URLSearchParams(h.state.search.slice(1)),
        // test helpers
        __setSearch: (s: string) => {
            h.state.search = s;
        },
        __getRouterFns: () => ({ push: h.push, replace: h.replace }),
    };
});

// pull helpers from the mock
// (TS will treat them as any in tests, which is fine)

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { __setSearch, __getRouterFns } from "next/navigation";
import { useSearchParamsParsed } from "@/hooks/useSearchParamsParsed";

describe("useSearchParamsParsed", () => {
    beforeEach(() => {
        h.push.mockClear();
        h.replace.mockClear();
        __setSearch(
            "?q=cat&page=2&size=40&db=st,sp&start=2020-01-01&end=2020-12-31"
        );
    });

    it("parses q/page/size/db/start/end from URL", () => {
        const { result } = renderHook(() => useSearchParamsParsed());

        expect(result.current.q).toBe("cat");
        expect(result.current.page).toBe(2);
        expect(result.current.size).toBe(40);
        expect(result.current.dbFromUrl).toEqual(["st", "sp"]);
        expect(result.current.start).toBe("2020-01-01");
        expect(result.current.end).toBe("2020-12-31");
        expect(result.current.qInput).toBe("cat");
    });

    it("onSubmitSearch(newTerm) clears filters and resets page", () => {
        const { result } = renderHook(() => useSearchParamsParsed());

        act(() => {
            result.current.onSubmitSearch("dog");
        });

        const { push } = __getRouterFns();
        expect(push).toHaveBeenCalledTimes(1);
        const calledWith = push.mock.calls[0][0] as string;
        const u = new URL(calledWith, "https://example.test"); // base to satisfy URL()

        // assert what's important
        expect(u.searchParams.get("q")).toBe("dog");
        expect(u.searchParams.get("page")).toBe("1");

        // filters cleared
        expect(u.searchParams.get("db")).toBeNull();
        expect(u.searchParams.get("start")).toBeNull();
        expect(u.searchParams.get("end")).toBeNull();

        // optionally: don't fail if size is present; just ensure if present it's valid
        const size = u.searchParams.get("size");
        if (size !== null) {
            expect(Number(size)).toBeGreaterThan(0);
        }
    });

    it("onPageChange patches only page (keeps other params)", () => {
        __setSearch(
            "?q=cat&page=2&size=40&db=st,sp&start=2020-01-01&end=2020-12-31"
        );
        const { result } = renderHook(() => useSearchParamsParsed());

        act(() => {
            result.current.onPageChange(3);
        });

        const { push } = __getRouterFns();
        const calledWith = push.mock.calls[0]![0] as string;
        const params = new URLSearchParams(calledWith.split("?")[1]);
        expect(params.get("q")).toBe("cat");
        expect(params.get("page")).toBe("3");
        expect(params.get("size")).toBe("40");
        expect(params.get("db")).toBe("st,sp");
        expect(params.get("start")).toBe("2020-01-01");
        expect(params.get("end")).toBe("2020-12-31");
    });
});
