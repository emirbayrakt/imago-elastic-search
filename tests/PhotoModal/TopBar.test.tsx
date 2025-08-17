import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TopBar from "@/app/components/PhotoModal/TopBar";

describe("TopBar", () => {
    it("shows title, chips and handles nav", async () => {
        const onPrev = vi.fn();
        const onNext = vi.fn();

        render(
            <TopBar
                title="Nice Title"
                dbLabel="Stock"
                date="01-02-2024"
                bildnummer="98765"
                hasPrev
                hasNext
                onPrev={onPrev}
                onNext={onNext}
            />
        );

        expect(screen.getByText("Nice Title")).toBeInTheDocument();
        expect(screen.getByText("Stock")).toBeInTheDocument();
        expect(screen.getByText("01-02-2024")).toBeInTheDocument();
        expect(screen.getByText("98765")).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: /previous/i })
        );
        await userEvent.click(screen.getByRole("button", { name: /next/i }));
        expect(onPrev).toHaveBeenCalledTimes(1);
        expect(onNext).toHaveBeenCalledTimes(1);
    });

    it("disables chevrons when hasPrev/hasNext are false", () => {
        render(
            <TopBar title="X" bildnummer="1" hasPrev={false} hasNext={false} />
        );
        const prev = screen.getByRole("button", { name: /previous/i });
        const next = screen.getByRole("button", { name: /next/i });
        expect(prev).toBeDisabled();
        expect(next).toBeDisabled();
    });
});
