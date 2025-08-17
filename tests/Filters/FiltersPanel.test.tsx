import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FiltersPanel from "@/app/components/Filters/FiltersPanel";
import type { FiltersState } from "@/app/components/Filters/types";

const base: FiltersState = { db: [], start: undefined, end: undefined };

describe("FiltersPanel", () => {
    it("shows header (desktop-only), body, and action links", () => {
        const onChange = vi.fn();
        const toggleDb = vi.fn();
        const update = vi.fn();
        const clearAll = vi.fn();

        render(
            <FiltersPanel
                value={base}
                onChange={onChange}
                toggleDb={toggleDb}
                update={update}
                clearAll={clearAll}
            />
        );

        // Body labels
        expect(screen.getByText(/collection/i)).toBeInTheDocument();
        expect(screen.getByText(/date range/i)).toBeInTheDocument();

        // Collection buttons exist
        expect(
            screen.getByRole("button", { name: /stock/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /sport/i })
        ).toBeInTheDocument();
    });

    it("calls handlers for toggleDb, update, and clearAll", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const toggleDb = vi.fn();
        const update = vi.fn();
        const clearAll = vi.fn();

        const { rerender } = render(
            <FiltersPanel
                value={{ db: [], start: undefined, end: undefined }}
                onChange={onChange}
                toggleDb={toggleDb}
                update={update}
                clearAll={clearAll}
            />
        );

        await user.click(screen.getByRole("button", { name: /stock/i }));
        expect(toggleDb).toHaveBeenCalledWith("st");

        const startInput = screen.getAllByLabelText(
            /start/i
        )[0] as HTMLInputElement;
        await user.type(startInput, "2024-04-05");
        expect(update).toHaveBeenCalled();

        // Re-render with active filters so the header Clear appears
        rerender(
            <FiltersPanel
                value={{ db: ["st"], start: "2024-01-01", end: "2024-02-01" }}
                onChange={onChange}
                toggleDb={toggleDb}
                update={update}
                clearAll={clearAll}
            />
        );

        // Target the header button by its aria-label to avoid the other "Clear" buttons
        const headerClear = screen.getByRole("button", {
            name: /clear all filters/i,
        });
        await user.click(headerClear);
        expect(clearAll).toHaveBeenCalled();
    });
});
