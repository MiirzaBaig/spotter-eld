import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

export default defineConfig(({ command }) => ({
  server: {
    port: 8080,
    host: true,
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    // Route TanStack Start's server entry through our SSR error wrapper.
    tanstackStart({ server: { entry: "server" } }),
    // Nitro produces the deployable server output at build time.
    // Set NITRO_PRESET=vercel (or another preset) when deploying.
    ...(command === "build" ? [nitro()] : []),
    viteReact(),
  ],
}));
