import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/inter-tight/400.css";
import "@fontsource/inter-tight/700.css";
import "@fontsource/inter-tight/800.css";
import "@fontsource/instrument-serif/400.css";

// Detect iframe embed and apply embed-specific styles
if (window !== window.parent) {
  document.documentElement.classList.add("is-embedded");
  document.body.classList.add("is-embedded");
}

createRoot(document.getElementById("root")!).render(<App />);
