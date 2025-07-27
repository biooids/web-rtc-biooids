// vitest.config.ts

import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true, // No need to import describe, it, expect, etc.
    environment: "node",
    setupFiles: ["./vitest.setup.ts"], // A file to run before all tests
  },
});
