import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Vite plugin that injects emitted CSS directly into the JS bundle
 * as a <style> tag, so the embed is a single .js file (+ font assets).
 */
function inlineCssPlugin() {
  return {
    name: "inline-css-into-js",
    apply: "build" as const,
    enforce: "post" as const,
    generateBundle(
      _options: unknown,
      bundle: Record<string, { type: string; fileName: string; source?: string; code?: string }>
    ) {
      let cssCode = "";
      let cssKey = "";
      let jsKey = "";

      for (const key of Object.keys(bundle)) {
        if (key.endsWith(".css")) {
          cssCode = bundle[key].source || "";
          cssKey = key;
        }
        if (key.endsWith(".js")) {
          jsKey = key;
        }
      }

      if (cssCode && jsKey) {
        delete bundle[cssKey];
        const injection = `(function(){var s=document.createElement("style");s.setAttribute("data-swipe-spin-show","");s.textContent=${JSON.stringify(cssCode)};document.head.appendChild(s)})();\n`;
        bundle[jsKey].code = injection + (bundle[jsKey].code || "");
      }
    },
  };
}

export default defineConfig({
  base: "/swipe-spin-show/",
  plugins: [react(), inlineCssPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/embed.tsx"),
      name: "SwipeSpinShow",
      formats: ["iife"],
      fileName: () => "embed.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    outDir: "dist",
    emptyOutDir: false, // Don't wipe the main site build
  },
});
