import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DetailsPanel from "@/app/components/PhotoModal/DetailsPanel";
import "../setup/mocks";

describe("DetailsPanel", () => {
    it("shows description, meta and actions", async () => {
        const onCopyId = vi.fn();
        const onCopyUrl = vi.fn();

        render(
            <DetailsPanel
                description="Desc text"
                photographer="John Smith"
                width={4000}
                height={3000}
                mp={(4000 * 3000) / 1_000_000}
                paddedId="0000001234"
                suchtext="summer; beach"
                onCopyId={onCopyId}
                onCopyUrl={onCopyUrl}
                openImagePageUrl="https://www.imago-images.de/stock/0000001234"
            />
        );

        expect(screen.getByText("Desc text")).toBeInTheDocument();
        expect(screen.getByText("John Smith")).toBeInTheDocument();
        expect(screen.getByText(/4000 × 3000px/)).toBeInTheDocument();
        expect(screen.getByText(/MP/)).toBeInTheDocument();
        expect(screen.getByText("0000001234")).toBeInTheDocument();
        expect(screen.getByText("summer; beach")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: /copy id/i }));
        await userEvent.click(
            screen.getByRole("button", { name: /copy url/i })
        );
        const link = screen.getByRole("link", { name: /open/i });
        expect(link).toHaveAttribute(
            "href",
            "https://www.imago-images.de/stock/0000001234"
        );
    });
});
