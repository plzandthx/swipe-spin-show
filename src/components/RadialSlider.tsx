import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface SliderCard {
  id: number;
  title: string;
  description: string;
  imagePlaceholder: string;
  bgColor?: string;
  textColor?: string;
}

interface RadialSliderProps {
  cards: SliderCard[];
  onLayoutReady?: () => void;
}

const CARD_WIDTH_SM = 280;
const CARD_HEIGHT_SM = 385;
const CARD_WIDTH_MD = 400;
const CARD_HEIGHT_MD = 550;
const CARD_WIDTH_LG = 590;
const CARD_HEIGHT_LG = 809;

const getBreakpoint = (width: number) => {
  if (width >= 1024) return "lg";
  if (width >= 768) return "md";
  return "sm";
};

const RadialSlider = ({ cards, onLayoutReady }: RadialSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const rafRef = useRef<number>(0);
  const arcParamsRef = useRef<{ centerX: number; centerY: number; radius: number } | null>(null);

  const totalCards = cards.length;
  const bp = typeof window !== "undefined" ? getBreakpoint(window.innerWidth) : "sm";
  const arcSpan = bp === "lg" ? 20 : bp === "md" ? 24 : 18;

  const drawArcDots = useCallback(
    (width: number, canvasHeight: number, cx: number, cy: number, r: number, extraTop: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const totalHeight = canvasHeight + extraTop;
      canvas.width = width * dpr;
      canvas.height = totalHeight * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${totalHeight}px`;
      canvas.style.top = `${-extraTop}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, totalHeight);

      // Shift all drawing down by extraTop so coordinates align
      const drawCy = cy + extraTop;

      const arcRange = 75;
      const startAngle = (-90 - arcRange) * Math.PI / 180;
      const endAngle = (-90 + arcRange) * Math.PI / 180;
      const lineStep = 24;
      const totalArcs = 50;
      const bp = getBreakpoint(width);
      const isMobile = bp === "sm";
      const fadeEdge = isMobile ? 20 : 10;
      const maxOpacity = isMobile ? 0.5 : 1;

      ctx.lineWidth = 1.5;

      for (let a = 0; a < totalArcs; a++) {
        const offset = (a - totalArcs / 2) * lineStep;
        const arcR = r + offset;
        if (arcR < 50) continue;

        let opacity = 1;
        if (a < fadeEdge) {
          opacity = a / fadeEdge;
        } else if (a > totalArcs - 1 - fadeEdge) {
          opacity = (totalArcs - 1 - a) / fadeEdge;
        }

        ctx.strokeStyle = `hsla(0, 0%, 100%, ${opacity * maxOpacity})`;
        ctx.setLineDash([3, 14]);
        ctx.beginPath();
        ctx.arc(cx, drawCy, arcR, startAngle, endAngle);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    },
    []
  );

  const positionCards = useCallback(
    (rotation: number, updateHeight = false) => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const bp = getBreakpoint(containerWidth);
      const cardW = bp === "lg" ? CARD_WIDTH_LG : bp === "md" ? CARD_WIDTH_MD : CARD_WIDTH_SM;
      const cardH = bp === "lg" ? CARD_HEIGHT_LG : bp === "md" ? CARD_HEIGHT_MD : CARD_HEIGHT_SM;

      const radius = bp === "lg" 
        ? Math.max(containerWidth * 0.9, 800) 
        : bp === "md" 
          ? Math.max(containerWidth * 1.4, 900) 
          : Math.max(containerWidth * 0.9, 800);
      const centerX = containerWidth / 2;
      const verticalOffset = bp === "lg" ? 0.03 : bp === "md" ? 0.02 : 0.05;
      const stableHeight = bp === "lg" ? 1100 : bp === "md" ? 800 : 600;
      const centerY = radius + stableHeight * verticalOffset + cardH / 2;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        const totalSpan = (totalCards - 1) * arcSpan;
        const baseAngle = -90 - totalSpan / 2 + i * arcSpan + rotation;
        
        const fullCircle = totalCards * arcSpan;
        let wrappedOffset = ((baseAngle + 90 + totalSpan / 2) % fullCircle + fullCircle) % fullCircle;
        const angle = -90 - totalSpan / 2 + wrappedOffset;

        const rad = (angle * Math.PI) / 180;

        const x = centerX + radius * Math.cos(rad) - cardW / 2;
        const y = centerY + radius * Math.sin(rad) - cardH / 2;

        const tilt = angle + 90;

        const normalizedAngle = Math.abs(((angle + 90) % 360 + 360) % 360);
        const absAngle = normalizedAngle > 180 ? 360 - normalizedAngle : normalizedAngle;

        gsap.set(card, {
          x,
          y,
          rotation: tilt,
          scale: 1,
          opacity: 1,
          zIndex: Math.round((1 - absAngle / 180) * 100),
        });
      });

      // Store arc params for dot drawing
      arcParamsRef.current = { centerX, centerY, radius };

      // Only recalculate container height on init / resize — not during
      // drag or momentum — to prevent sections below from jumping.
      if (updateHeight) {
        const containerTop = container.getBoundingClientRect().top;
        let maxBottom = 0;
        cardRefs.current.forEach((card) => {
          if (!card) return;
          const rect = card.getBoundingClientRect();
          const bottom = rect.bottom - containerTop + container.scrollTop;
          if (bottom > maxBottom) maxBottom = bottom;
        });
        container.style.height = `${maxBottom}px`;
        onLayoutReady?.();
      }
    },
    [arcSpan, totalCards, onLayoutReady]
  );

  // Draw dots once and only redraw on resize — not on card rotation
  const drawDots = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerWidth = container.offsetWidth;
    const bp = getBreakpoint(containerWidth);
    const cardH = bp === "lg" ? CARD_HEIGHT_LG : bp === "md" ? CARD_HEIGHT_MD : CARD_HEIGHT_SM;
    const radius = bp === "lg"
      ? Math.max(containerWidth * 0.9, 800)
      : bp === "md"
        ? Math.max(containerWidth * 1.4, 900)
        : Math.max(containerWidth * 0.9, 800);
    const centerX = containerWidth / 2;
    const verticalOffset = bp === "lg" ? 0.03 : bp === "md" ? 0.02 : 0.05;
    const stableHeight = bp === "lg" ? 1100 : bp === "md" ? 800 : 600;
    const centerY = radius + stableHeight * verticalOffset + cardH / 2;

    const maxBottom = container.offsetHeight || stableHeight;
    const shiftUp = maxBottom * 0.05;
    const extraTop = 300;
    drawArcDots(containerWidth, maxBottom, centerX, centerY - shiftUp, radius, extraTop);
  }, [drawArcDots]);

  const snapToNearest = useCallback(() => {
    const snapped = Math.round(rotationRef.current / arcSpan) * arcSpan;
    gsap.to(rotationRef, {
      current: snapped,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => positionCards(rotationRef.current),
    });
  }, [arcSpan, positionCards]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Guard against 0-width container (common in Webflow embeds where layout
    // hasn't completed when the useEffect fires). Retry until width is available.
    let retryCount = 0;
    const initLayout = () => {
      const w = container.offsetWidth;
      console.log(`[swipe-spin-show] initLayout attempt ${retryCount}, width: ${w}`);
      if (w === 0 && retryCount < 60) {
        retryCount++;
        requestAnimationFrame(initLayout);
        return;
      }
      if (w === 0) {
        console.error("[swipe-spin-show] container still 0-width after 60 frames, forcing layout");
      }
      positionCards(rotationRef.current, true);
      requestAnimationFrame(() => drawDots());
    };
    initLayout();

    // --- Pointer-based drag handling ---
    // touch-action: pan-y on the container lets the browser handle vertical
    // scrolling natively. Horizontal movement fires pointer events which we
    // use to rotate the cards. This replaces GSAP Draggable which overrides
    // touch-action to "none" and blocks page scrolling on mobile.
    let dragging = false;
    let lastTime = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      lastXRef.current = e.clientX;
      lastTime = Date.now();
      velocityRef.current = 0;
      gsap.killTweensOf(rotationRef);
      cancelAnimationFrame(rafRef.current);
      // Only capture for mouse — capturing touch would override touch-action
      if (e.pointerType === "mouse") {
        container.setPointerCapture(e.pointerId);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastXRef.current;
      const now = Date.now();
      const dt = Math.max(now - lastTime, 1);
      velocityRef.current = (dx / dt) * 16;
      lastXRef.current = e.clientX;
      lastTime = now;
      rotationRef.current += dx * 0.12;
      positionCards(rotationRef.current);
    };

    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      const decay = () => {
        velocityRef.current *= 0.92;
        if (Math.abs(velocityRef.current) > 0.3) {
          rotationRef.current += velocityRef.current * 0.12;
          positionCards(rotationRef.current);
          rafRef.current = requestAnimationFrame(decay);
        } else {
          snapToNearest();
        }
      };
      rafRef.current = requestAnimationFrame(decay);
    };

    const onPointerCancel = () => {
      if (!dragging) return;
      dragging = false;
      velocityRef.current = 0;
      snapToNearest();
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerCancel);

    const handleResize = () => {
      positionCards(rotationRef.current, true);
      drawDots();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [positionCards, snapToNearest, drawDots]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        overflow: "visible",
        minHeight: "400px",
        touchAction: "pan-y pinch-zoom",
        cursor: "grab",
        marginTop: "clamp(20px, 5vh, 60px)",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {cards.map((card, i) => (
        <div
          key={card.id}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className="slider-card"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "clamp(280px, min(55vw, 42vw + 60px), 590px)",
            height: "auto",
            aspectRatio: `${CARD_WIDTH_LG} / ${CARD_HEIGHT_LG}`,
            padding: "clamp(1rem, 2.5vw, 1.75rem)",
            willChange: "transform",
            backgroundColor: card.bgColor ? `#${card.bgColor}` : undefined,
            color: card.textColor || undefined,
          }}
        >
          <div
            className="slider-card__image"
            style={{
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "65%",
              backgroundColor: card.textColor
                ? `${card.textColor === "white" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"}`
                : "hsl(var(--slider-card-fg) / 0.08)",
            }}
          >
            <span style={{ fontSize: "1.875rem", color: card.textColor || undefined }}>
              {card.imagePlaceholder}
            </span>
          </div>

          <div
            className="slider-card__content"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              textAlign: "center",
              width: "100%",
              padding: "0 15%",
            }}
          >
            <h3
              style={{
                color: card.textColor || undefined,
                fontFamily: "'Inter Tight', sans-serif",
                fontWeight: 400,
                fontSize: "clamp(1.275rem, 3vw, 2.55rem)",
                lineHeight: 1.3,
              }}
            >
              {card.title}
            </h3>
            <p
              className={!card.textColor ? "slider-card__text" : ""}
              style={{
                color: card.textColor === "white" ? "white" : card.textColor ? "#333333" : undefined,
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "clamp(1rem, 2.25vw, 1.4rem)",
                fontWeight: 300,
                lineHeight: 1.6,
              }}
            >
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RadialSlider;
