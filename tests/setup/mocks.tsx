import { vi } from "vitest";

// Mock next/image to behave like a plain <img />
vi.mock("next/image", () => {
    return {
        default: (props: any) => {
            const { src, alt = "", onError, onLoad, ...rest } = props;
            // Fire onLoad as soon as it's mounted so fade-in paths are covered
            setTimeout(() => onLoad?.({} as any), 0);
            return (
                <img
                    src={src}
                    alt={alt}
                    onError={onError}
                    {...rest}
                    // Ensure it can render in jsdom even if "fill" prop is passed
                    style={{ ...(rest.style || {}), objectFit: "contain" }}
                />
            );
        },
    };
});

// Mock navigator.clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
    },
});
