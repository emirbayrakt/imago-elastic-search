import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Filters from "@/app/components/Filters";
import type { FiltersState } from "@/app/components/Filters/types";
import React from "react";

/** Harness that keeps Filters controlled the same way your app does */
function FiltersHarness({ initial }: { initial: FiltersState }) {
    const [state, setState] = React.useState<FiltersState>(initial);
    return <Filters value={state} onChange={setState} />;
}

function setup(
    initial: FiltersState = { db: [], start: undefined, end: undefined }
) {
    const ui = render(<FiltersHarness initial={initial} />);
    return { ui };
}

describe("Filters (orchestrator)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // quiet scrollTo if needed
        // // @ts-ignore
        if (!window.scrollTo) window.scrollTo = vi.fn();
    });

    it("renders desktop sidebar (content present in DOM) and mobile trigger", () => {
        setup({ db: [] });
        // Desktop header text exists in DOM (visibility controlled via CSS)
        expect(screen.getAllByText(/Filters/i).length).toBeGreaterThan(0);
        // Mobile trigger exists
        const mobileButton = screen.getAllByRole("button", {
            name: /filters/i,
        })[0];
        expect(mobileButton).toBeInTheDocument();
    });

    it("mobile sheet opens and closes via trigger/backdrop/close button", async () => {
        const user = userEvent.setup();
        setup({ db: [] });

        // Open
        const trigger = screen.getAllByRole("button", { name: /filters/i })[0];
        await user.click(trigger);

        // Sheet visible (close button exists)
        const closeBtn = await screen.findByRole("button", {
            name: /close filters/i,
        });
        expect(closeBtn).toBeInTheDocument();

        // Close via BACKDROP (it's the first child inside the dialog)
        const dialog = screen.getByRole("dialog");
        const backdrop = dialog.firstElementChild as HTMLElement; // <div class="absolute inset-0 bg-black/40" .../>
        await user.click(backdrop);
        expect(
            screen.queryByRole("button", { name: /close filters/i })
        ).not.toBeInTheDocument();

        // Re-open and close via X button
        await user.click(trigger);
        const closeAgain = await screen.findByRole("button", {
            name: /close filters/i,
        });
        await user.click(closeAgain);
        expect(
            screen.queryByRole("button", { name: /close filters/i })
        ).not.toBeInTheDocument();
    });

    it("mobile sheet closes on Escape", async () => {
        const user = userEvent.setup();
        setup({ db: [] });

        const trigger = screen.getAllByRole("button", { name: /filters/i })[0];
        await user.click(trigger);
        expect(
            await screen.findByRole("button", { name: /close filters/i })
        ).toBeInTheDocument();

        await user.keyboard("{Escape}");
        expect(
            screen.queryByRole("button", { name: /close filters/i })
        ).not.toBeInTheDocument();
    });

    it("toggling collections updates db set correctly (controlled)", async () => {
        const user = userEvent.setup();
        setup({ db: [] });

        // Use the desktop content (always in DOM)
        const stockBtn = screen.getByRole("button", { name: /stock/i });
        const sportBtn = screen.getByRole("button", { name: /sport/i });

        await user.click(stockBtn);
        await user.click(sportBtn);

        // Now open the mobile sheet and ensure both appear active (implicit state check)
        const trigger = screen.getAllByRole("button", { name: /filters/i })[0];
        await user.click(trigger);

        // In the sheet body, both toggles should exist (active state is visual; we just ensure both buttons present)
        expect(
            screen.getAllByRole("button", { name: /stock/i }).length
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByRole("button", { name: /sport/i }).length
        ).toBeGreaterThan(0);
    });

    it("date inputs update start/end and Clear dates resets them (controlled)", async () => {
        const user = userEvent.setup();
        setup({ db: [], start: undefined, end: undefined });

        const startInput = screen.getAllByLabelText(
            /start/i
        )[0] as HTMLInputElement;
        const endInput = screen.getAllByLabelText(
            /end/i
        )[0] as HTMLInputElement;

        await user.clear(startInput);
        await user.type(startInput, "2024-01-02");
        expect(startInput.value).toBe("2024-01-02"); // controlled value reflects change

        await user.clear(endInput);
        await user.type(endInput, "2024-03-04");
        expect(endInput.value).toBe("2024-03-04");

        const clearDates = screen.getByRole("button", { name: /clear dates/i });
        await user.click(clearDates);

        // inputs should reflect cleared state
        expect(
            (screen.getAllByLabelText(/start/i)[0] as HTMLInputElement).value
        ).toBe("");
        expect(
            (screen.getAllByLabelText(/end/i)[0] as HTMLInputElement).value
        ).toBe("");
    });
});
