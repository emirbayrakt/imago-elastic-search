import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileSheet } from "@/app/components/Filters/MobileSheet";

describe("MobileSheet", () => {
    it("does not render when open=false", () => {
        render(
            <MobileSheet open={false} onClose={vi.fn()} onClear={vi.fn()}>
                <div>Panel</div>
            </MobileSheet>
        );
        expect(screen.queryByText("Panel")).not.toBeInTheDocument();
    });

    it("renders when open=true and closes on Close/Apply/Backdrop; Clear fires onClear", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        const onClear = vi.fn();

        const { container, rerender } = render(
            <MobileSheet open={true} onClose={onClose} onClear={onClear}>
                <div>Panel</div>
            </MobileSheet>
        );

        // Close via X
        await user.click(
            screen.getByRole("button", { name: /close filters/i })
        );
        expect(onClose).toHaveBeenCalled();

        // Reopen to test other actions
        rerender(
            <MobileSheet open={true} onClose={onClose} onClear={onClear}>
                <div>Panel</div>
            </MobileSheet>
        );

        // Close via Apply
        await user.click(screen.getByRole("button", { name: /apply/i }));
        expect(onClose).toHaveBeenCalledTimes(2);

        // Reopen to test Clear
        rerender(
            <MobileSheet open={true} onClose={onClose} onClear={onClear}>
                <div>Panel</div>
            </MobileSheet>
        );

        await user.click(screen.getByRole("button", { name: /clear/i }));
        expect(onClear).toHaveBeenCalled();

        // Reopen to test backdrop
        rerender(
            <MobileSheet open={true} onClose={onClose} onClear={onClear}>
                <div>Panel</div>
            </MobileSheet>
        );

        // The backdrop is the first child of the dialog wrapper
        const dialog = screen.getByRole("dialog");
        const backdrop = dialog.firstElementChild as HTMLElement;
        await user.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(3);
    });
});
