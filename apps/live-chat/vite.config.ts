import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: { strictPort: true, port: 5300 },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
});
