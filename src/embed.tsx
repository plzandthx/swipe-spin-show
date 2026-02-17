/**
 * Embed entry point — mounts the RadialSlider directly into the host page.
 * No iframe, no scroll isolation. Just a <script> tag + a target <div>.
 *
 * Usage in Webflow:
 *   <div id="swipe-spin-show"></div>
 *   <script src="https://plzandthx.github.io/swipe-spin-show/embed.js"></script>
 */
import { createRoot } from "react-dom/client";
import RadialSlider from "@/components/RadialSlider";
import "./embed.css";

// Load Inter Tight from Google Fonts instead of bundling font files
(function loadFont() {
  if (document.querySelector('link[data-swipe-spin-show-font]')) return;
  const preconnect = document.createElement("link");
  preconnect.rel = "preconnect";
  preconnect.href = "https://fonts.googleapis.com";
  document.head.appendChild(preconnect);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;700;800&display=swap";
  link.setAttribute("data-swipe-spin-show-font", "");
  document.head.appendChild(link);
})();

const sliderCards = [
  {
    id: 1,
    title: "92% ARR Growth",
    description:
      "Annual recurring revenue growth driven by a culture of innovation and experimentation",
    imagePlaceholder: "\u{1F3A8} Image",
    bgColor: "224F3C",
    textColor: "white",
  },
  {
    id: 2,
    title: "3X Acquisitions",
    description:
      "Company acquisitions while operating as head of design",
    imagePlaceholder: "\u2728 Image",
    bgColor: "2E2E2E",
    textColor: "white",
  },
  {
    id: 3,
    title: "25% Optimization",
    description:
      "Enterprise-level conversion optimization unlocked by deep customer insights",
    imagePlaceholder: "\u{1F4BB} Image",
    bgColor: "FFFFFF",
    textColor: "#333333",
  },
  {
    id: 4,
    title: "4.8 CSAT",
    description:
      "Customer satisfaction score launching innovative 0\u21921 product experiences",
    imagePlaceholder: "\u{1F4CA} Image",
    bgColor: "58B469",
    textColor: "white",
  },
  {
    id: 5,
    title: "360% EBITDA Growth",
    description:
      "EBITDA growth on key verticals while leading design across a FinTech portfolio",
    imagePlaceholder: "\u{1F9ED} Image",
    bgColor: "0D2B1E",
    textColor: "white",
  },
];

function mount() {
  const target = document.getElementById("swipe-spin-show");
  if (!target) {
    console.warn(
      '[swipe-spin-show] No element with id="swipe-spin-show" found. Add <div id="swipe-spin-show"></div> to your page.'
    );
    return;
  }

  // Ensure mount target has block layout so it gets width from its parent,
  // regardless of how Webflow styles it.
  target.style.display = "block";
  target.style.width = "100%";

  const root = createRoot(target);
  root.render(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowX: "hidden",
        fontFamily: "'Inter Tight', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          width: "100%",
          paddingTop: "3rem",
          paddingBottom: "4rem",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            whiteSpace: "nowrap",
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 4.5rem)",
            color: "hsl(0 0% 18%)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          Impact by Design
        </h2>
        <span
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#999",
            opacity: 0.6,
          }}
        >
          Drag to explore
        </span>
      </div>

      <div style={{ width: "100%" }}>
        <RadialSlider cards={sliderCards} />
      </div>
    </div>
  );
}

// Mount as soon as the DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
