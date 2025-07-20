import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

// Type guard to check for CJS/ESM default export interop
const isObjectWithDefault = (
  module: unknown
): module is { default: (...args: unknown[]) => Plugin } => {
  return (
    typeof module === "object" &&
    module !== null &&
    "default" in module &&
    typeof (module as { default: unknown }).default === "function"
  );
};

const resolvedMonacoPlugin = isObjectWithDefault(monacoEditorPlugin)
  ? monacoEditorPlugin.default
  : (monacoEditorPlugin as (...args: unknown[]) => Plugin);

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    hmr: {
      port: 5173,
    },
  },
  plugins: [react(), resolvedMonacoPlugin({})],
});
