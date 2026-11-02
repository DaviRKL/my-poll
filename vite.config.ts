import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
      routeFileIgnorePattern: "\\.(test|spec)\\.(js|jsx|ts|tsx)$",
    }),
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const moduleId = id.replaceAll("\\", "/");
          const packagePath = moduleId.split("/node_modules/")[1];

          if (!packagePath) return;

          if (
            packagePath.startsWith("@firebase/app/") ||
            packagePath.startsWith("firebase/app/")
          ) {
            return "firebase-app";
          }

          if (
            packagePath.startsWith("@firebase/auth/") ||
            packagePath.startsWith("firebase/auth/")
          ) {
            return "firebase-auth";
          }

          if (
            packagePath.startsWith("@firebase/firestore/") ||
            packagePath.startsWith("firebase/firestore/")
          ) {
            return "firebase-firestore";
          }

          if (
            packagePath.startsWith("@firebase/") ||
            packagePath.startsWith("firebase/")
          ) {
            return "firebase-shared";
          }

          if (
            packagePath.startsWith("react/") ||
            packagePath.startsWith("react-dom/") ||
            packagePath.startsWith("scheduler/") ||
            packagePath.startsWith("@tanstack/react-router/") ||
            packagePath.startsWith("@tanstack/router-core/")
          ) {
            return "react-router";
          }

          if (
            packagePath.startsWith("i18next/") ||
            packagePath.startsWith("react-i18next/") ||
            packagePath.startsWith("i18next-browser-languagedetector/") ||
            packagePath.startsWith("lucide-react/")
          ) {
            return "i18n-icons";
          }
        },
      },
    },
  },
});
