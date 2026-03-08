import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["vite.svg"],
      manifest: {
        name: "College ERP System",
        short_name: "College ERP",
        description: "Complete College Management System",
        theme_color: "#7c3aed",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/vite.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "/vite.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: false,
  },
});