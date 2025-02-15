import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load the environment variables from `.env` files
  const apiUrl = process.env.VITE_API_URL || "http://localhost:3000";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": apiUrl,
        "/cable": apiUrl.replace(/^http/, "ws"), // Convert to ws:// or wss://
      },
    },
  };
});
