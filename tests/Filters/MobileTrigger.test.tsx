import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileTrigger } from "@/app/components/Filters/MobileTrigger";

describe("MobileTrigger", () => {
    it("renders and fires onOpen", async () => {
        const user = userEvent.setup();
        const onOpen = vi.fn();
        render(<MobileTrigger open={false} onOpen={onOpen} />);
        const btn = screen.getByRole("button", { name: /filters/i });
        await user.click(btn);
        expect(onOpen).toHaveBeenCalled();
    });
});
