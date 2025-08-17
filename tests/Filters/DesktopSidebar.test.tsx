import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DesktopSidebar } from "@/app/components/Filters/DesktopSidebar";

describe("DesktopSidebar", () => {
    it("renders children", () => {
        render(
            <DesktopSidebar>
                <div>Child content</div>
            </DesktopSidebar>
        );
        expect(screen.getByText("Child content")).toBeInTheDocument();
    });
});
