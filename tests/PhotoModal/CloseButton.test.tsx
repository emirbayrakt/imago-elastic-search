import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CloseButton from "@/app/components/PhotoModal/CloseButton";

describe("CloseButton", () => {
    it("calls onClose when clicked", async () => {
        const onClose = vi.fn();
        render(<CloseButton onClose={onClose} />);
        await userEvent.click(screen.getByRole("button", { name: /close/i }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
