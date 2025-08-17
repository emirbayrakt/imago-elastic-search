import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModalFrame from "@/app/components/PhotoModal/ModalFrame";

describe("ModalFrame", () => {
    it("renders children when open and closes on backdrop click", async () => {
        const onClose = vi.fn();
        render(
            <ModalFrame open onClose={onClose}>
                <div>content</div>
            </ModalFrame>
        );

        expect(screen.getByText("content")).toBeInTheDocument();

        // clicking backdrop (role=dialog)
        await userEvent.click(screen.getByRole("dialog"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("returns null when not open", () => {
        const { container } = render(
            <ModalFrame open={false} onClose={() => {}}>
                <div>content</div>
            </ModalFrame>
        );
        expect(container).toBeEmptyDOMElement();
    });
});
