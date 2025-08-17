import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PhotoModal from "@/app/components/PhotoModal";
import "../setup/mocks";

const baseDoc = {
    id: "abc",
    title: "A Great Photo",
    description: "Lovely scene.",
    db: "st",
    // NOTE: Must match the regex used in the component for canonical URL
    thumbnailUrl: "https://www.imago-images.de/bild/stock/0000001234/s.jpg",
    date: "2024-01-23T12:00:00.000Z",
    mediaId: "12345",
    paddedMediaId: "0000001234",
    raw: {
        suchtext: "mountain; lake; sunrise",
        fotografen: "Jane Doe",
        breite: 4000,
        hoehe: 3000,
        bildnummer: "12345",
    },
};

function renderModal(
    overrides: Partial<Parameters<typeof PhotoModal>[0]> = {}
) {
    const onClose = vi.fn();
    const onPrev = vi.fn();
    const onNext = vi.fn();

    const props = {
        open: true,
        doc: baseDoc,
        onClose,
        onPrev,
        onNext,
        hasPrev: true,
        hasNext: true,
        ...overrides,
    };

    const utils = render(<PhotoModal {...props} />);
    return { ...utils, onClose, onPrev, onNext, props };
}

describe("PhotoModal (integration)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("does not render when open=false or doc is null", () => {
        const { rerender } = render(
            <PhotoModal open={false} doc={null} onClose={() => {}} />
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

        rerender(<PhotoModal open={true} doc={null} onClose={() => {}} />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders title, chips, and bildnummer", async () => {
        renderModal();

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("A Great Photo")).toBeInTheDocument();

        // Chips
        expect(screen.getByText("Stock")).toBeInTheDocument(); // dbLabel
        expect(screen.getByText("23/01/2024")).toBeInTheDocument(); // formatted date
        expect(screen.getByText("12345")).toBeInTheDocument(); // bildnummer
    });

    it("close by clicking floating X", async () => {
        const { onClose } = renderModal();
        const closeBtn = screen.getByRole("button", { name: /close/i });
        await userEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("close by clicking backdrop", async () => {
        const { onClose } = renderModal();
        // Backdrop is the element with role=dialog (click target == backdropRef)
        const backdrop = screen.getByRole("dialog");
        await userEvent.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("keyboard ESC closes; ArrowLeft/Right call prev/next when enabled", async () => {
        const { onClose, onPrev, onNext } = renderModal();
        fireEvent.keyDown(window, { key: "ArrowLeft" });
        expect(onPrev).toHaveBeenCalledTimes(1);

        fireEvent.keyDown(window, { key: "ArrowRight" });
        expect(onNext).toHaveBeenCalledTimes(1);

        fireEvent.keyDown(window, { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("chevrons reflect disabled state from hasPrev/hasNext", async () => {
        renderModal({ hasPrev: false, hasNext: false });
        const buttons = screen.getAllByRole("button");
        const prev = buttons.find(
            (b) => b.getAttribute("aria-label") === "Previous"
        )!;
        const next = buttons.find(
            (b) => b.getAttribute("aria-label") === "Next"
        )!;
        expect(prev).toBeDisabled();
        expect(next).toBeDisabled();
    });

    it("copy buttons call clipboard and show toast", async () => {
        renderModal();

        const copyId = screen.getByRole("button", { name: /copy id/i });
        await userEvent.click(copyId);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith("12345");
        // toast appears
        expect(await screen.findByText(/ID copied/i)).toBeInTheDocument();

        const copyUrl = screen.getByRole("button", { name: /copy url/i });
        await userEvent.click(copyUrl);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            "https://www.imago-images.de/bild/stock/0000001234/w.jpg"
        );
        expect(await screen.findByText(/URL copied/i)).toBeInTheDocument();
    });

    it("open link points to canonical page", async () => {
        renderModal();
        const link = screen.getByRole("link", { name: /open/i });
        expect(link).toHaveAttribute(
            "href",
            "https://www.imago-images.de/stock/0000001234"
        );
    });
});
