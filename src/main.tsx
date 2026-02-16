import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/inter-tight/700.css";
import "@fontsource/inter-tight/800.css";

createRoot(document.getElementById("root")!).render(<App />);
