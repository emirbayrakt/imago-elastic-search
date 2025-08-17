import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./tests/setupTests.ts"],
        include: ["tests/**/*.{test,spec}.{ts,tsx}"],
        css: false,
        restoreMocks: true,
        clearMocks: true,
    },
});
