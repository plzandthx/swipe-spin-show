import { useEffect, useRef, useCallback } from "react";
import RadialSlider from "@/components/RadialSlider";
import { useTypewriter } from "@/hooks/use-typewriter";

const sliderCards = [
  {
    id: 1,
    title: "92% ARR Growth",
    description: "Annual recurring revenue growth driven by a culture of innovation and experimentation",
    imagePlaceholder: "🎨 Image",
    bgColor: "224F3C",
    textColor: "white",
  },
  {
    id: 2,
    title: "3X Acquisitions",
    description: "Company acquisitions while operating as head of design",
    imagePlaceholder: "✨ Image",
    bgColor: "2E2E2E",
    textColor: "white",
  },
  {
    id: 3,
    title: "25% Optimization",
    description: "Enterprise-level conversion optimization unlocked by deep customer insights",
    imagePlaceholder: "💻 Image",
    bgColor: "FFFFFF",
    textColor: "#333333",
  },
  {
    id: 4,
    title: "4.8 CSAT",
    description: "Customer satisfaction score launching innovative 0→1 product experiences",
    imagePlaceholder: "📊 Image",
    bgColor: "58B469",
    textColor: "white",
  },
  {
    id: 5,
    title: "360% EBITDA Growth",
    description: "EBITDA growth on key verticals while leading design across a FinTech portfolio",
    imagePlaceholder: "🧭 Image",
    bgColor: "0D2B1E",
    textColor: "white",
  },
];

const isEmbedded = window !== window.parent;

const HEADING_TEXT = "Impact by Design";

const Index = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { displayText, showCursor } = useTypewriter({ text: HEADING_TEXT });

  const postHeight = useCallback(() => {
    if (!isEmbedded || !wrapperRef.current) return;
    const height = wrapperRef.current.scrollHeight;
    window.parent.postMessage({ type: "swipe-spin-show:resize", height }, "*");
  }, []);

  useEffect(() => {
    if (!isEmbedded) return;
    // Observe size changes and forward height to parent frame
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => postHeight());
    ro.observe(el);
    // Also post after a short delay to catch GSAP layout settling
    const t = setTimeout(postHeight, 500);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, [postHeight]);

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col items-center overflow-x-hidden"
      style={{ background: "transparent" }}
    >
      <div className="relative z-10 flex flex-col items-center gap-6 w-full pt-12 pb-16" style={{ marginBottom: "0" }}>
        <h1
          className="text-center whitespace-nowrap"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 600,
            fontSize: "clamp(2rem, 5vw, 4.5rem)",
            color: "hsl(0 0% 18%)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            position: "relative",
          }}
        >
          {/* Invisible placeholder keeps layout stable during typing */}
          <span style={{ visibility: "hidden" }}>{HEADING_TEXT}</span>
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
            }}
          >
            {displayText}
            <span
              style={{
                opacity: showCursor ? 1 : 0,
                transition: "opacity 0.1s",
                fontWeight: 300,
                marginLeft: "1px",
              }}
            >
              |
            </span>
          </span>
        </h1>
        <span className="text-xs tracking-widest uppercase text-muted-foreground opacity-60">
          Drag to explore
        </span>
      </div>

      <div className="w-full" style={{ overflowX: "hidden" }}>
        <RadialSlider cards={sliderCards} onLayoutReady={postHeight} />
      </div>
    </div>
  );
};

export default Index;
