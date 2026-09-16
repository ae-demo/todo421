import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { mockMode } from "./mock/plugin";

export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === "mock" ? [mockMode()] : [])],
}));
