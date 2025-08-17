import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Toast from "@/app/components/PhotoModal/Toast";

describe("Toast", () => {
    it("renders nothing when no text", () => {
        const { container } = render(<Toast text={""} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("renders text when provided", () => {
        render(<Toast text="ID copied" />);
        expect(screen.getByText(/ID copied/i)).toBeInTheDocument();
    });
});
