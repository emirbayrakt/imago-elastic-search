import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CollectionButton from "@/app/components/Filters/CollectionButton";
import { Image as ImageIcon } from "lucide-react";

describe("CollectionButton", () => {
    it("renders label, icon and handles click", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(
            <CollectionButton
                label="Stock"
                active={false}
                onClick={onClick}
                icon={<ImageIcon data-testid="icon" />}
            />
        );
        expect(screen.getByText("Stock")).toBeInTheDocument();
        expect(screen.getByTestId("icon")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /stock/i }));
        expect(onClick).toHaveBeenCalled();
    });

    it("reflects active state via aria-pressed", () => {
        const { rerender } = render(
            <CollectionButton
                label="Stock"
                active={false}
                onClick={() => {}}
                icon={<ImageIcon />}
            />
        );
        const btn = screen.getByRole("button", { name: /stock/i });
        expect(btn).toHaveAttribute("aria-pressed", "false");

        rerender(
            <CollectionButton
                label="Stock"
                active={true}
                onClick={() => {}}
                icon={<ImageIcon />}
            />
        );
        expect(screen.getByRole("button", { name: /stock/i })).toHaveAttribute(
            "aria-pressed",
            "true"
        );
    });
});
