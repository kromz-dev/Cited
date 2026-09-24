import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    // Resolve @ alias to match tsconfig paths
    alias: {
      "@": path.resolve(__dirname, "."),
    },
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json", "lcov"],
      reportsDirectory: "./coverage",
      // Only measure coverage on source code, not tests or config
      include: [
        "app/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "inngest/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/*.d.ts",
        "**/node_modules/**",
        "**/.next/**",
        "app/_ds/**", // design system assets
      ],
      // Thresholds — ratchet: set to current level and never let it drop
      thresholds: {
        // Start conservative — tighten once we measure the baseline
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
  },
});
