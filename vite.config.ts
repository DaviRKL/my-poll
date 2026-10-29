import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: !process.env.VITEST,
      routeFileIgnorePattern: "\\.(test|spec)\\.(js|jsx|ts|tsx)$",
    }),
    react(),
    tailwindcss(),
  ],
  // @ts-expect-error vitest config property
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});

