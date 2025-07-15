import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: { strictPort: true, port: 4300 },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
  ],
});
