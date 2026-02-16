import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

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
}

const CARD_WIDTH_SM = 280;
const CARD_HEIGHT_SM = 385;
const CARD_WIDTH_MD = 400;
const CARD_HEIGHT_MD = 550;
const CARD_WIDTH_LG = 520;
const CARD_HEIGHT_LG = 713;

const getBreakpoint = (width: number) => {
  if (width >= 1024) return "lg";
  if (width >= 768) return "md";
  return "sm";
};

const RadialSlider = ({ cards }: RadialSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const rafRef = useRef<number>(0);

  const totalCards = cards.length;
  const bp = typeof window !== "undefined" ? getBreakpoint(window.innerWidth) : "sm";
  const arcSpan = bp === "lg" ? 20 : bp === "md" ? 24 : 18;

  const positionCards = useCallback(
    (rotation: number) => {
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
      const centerY = radius + containerHeight * verticalOffset + cardH / 2;

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
    },
    [arcSpan, totalCards]
  );

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

    positionCards(rotationRef.current);

    const proxy = document.createElement("div");
    proxy.style.position = "absolute";
    proxy.style.width = "1px";
    proxy.style.height = "1px";
    proxy.style.visibility = "hidden";
    container.appendChild(proxy);

    let lastTime = 0;

    const draggable = Draggable.create(proxy, {
      type: "x",
      trigger: container,
      cursor: "grab",
      activeCursor: "grabbing",
      onDragStart: function () {
        velocityRef.current = 0;
        lastXRef.current = this.x;
        lastTime = Date.now();
        gsap.killTweensOf(rotationRef);
        cancelAnimationFrame(rafRef.current);
      },
      onDrag: function () {
        const dx = this.x - lastXRef.current;
        const now = Date.now();
        const dt = Math.max(now - lastTime, 1);
        velocityRef.current = (dx / dt) * 16;
        lastXRef.current = this.x;
        lastTime = now;

        // No clamping — infinite rotation
        rotationRef.current += dx * 0.12;
        positionCards(rotationRef.current);
      },
      onDragEnd: function () {
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
      },
    });


    const handleResize = () => positionCards(rotationRef.current);
    window.addEventListener("resize", handleResize);

    return () => {
      draggable[0]?.kill();
      proxy.remove();
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [positionCards, snapToNearest]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-visible"
      style={{
        height: "clamp(600px, 80vh, 1100px)",
        touchAction: "none",
        marginTop: "clamp(20px, 5vh, 60px)",
      }}
    >
      {cards.map((card, i) => (
        <div
          key={card.id}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className="slider-card absolute top-0 left-0 flex flex-col items-center"
          style={{
            width: "clamp(280px, min(55vw, 42vw + 60px), 520px)",
            height: "auto",
            aspectRatio: `${CARD_WIDTH_LG} / ${CARD_HEIGHT_LG}`,
            padding: "clamp(1rem, 2.5vw, 1.75rem)",
            willChange: "transform",
            backgroundColor: card.bgColor ? `#${card.bgColor}` : undefined,
            color: card.textColor || undefined,
          }}
        >
          <div
            className="slider-card__image mb-5 flex items-center justify-center w-full"
            style={{
              height: "65%",
              backgroundColor: card.textColor
                ? `${card.textColor === "white" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"}`
                : "hsl(var(--slider-card-fg) / 0.08)",
            }}
          >
            <span className="text-3xl" style={{ color: card.textColor || undefined }}>
              {card.imagePlaceholder}
            </span>
          </div>

          <div className="flex flex-col gap-3 text-center w-full" style={{ padding: "0 15%" }}>
            <h3
              style={{
                color: card.textColor || undefined,
                fontFamily: "'Inter Tight', sans-serif",
                fontWeight: 600,
                fontSize: "clamp(1.275rem, 3vw, 2.55rem)",
                lineHeight: 1.3,
              }}
            >
              {card.title}
            </h3>
            <p
              style={{
                color: card.textColor === "white" ? "white" : card.textColor ? "#333333" : undefined,
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: "clamp(1.1rem, 2.5vw, 1.5625rem)",
                lineHeight: 1.6,
              }}
              className={!card.textColor ? "slider-card__text" : ""}
            >
              {card.description}
            </p>
          </div>
        </div>
      ))}

      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-6"
        style={{ bottom: "clamp(10px, -8vw + 120px, 100px)" }}
      >
        <h1
          className="text-center whitespace-nowrap"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 4.5rem)",
            color: "hsl(0 0% 18%)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          Impact by Design
        </h1>
        <span className="text-xs tracking-widest uppercase text-muted-foreground opacity-60">
          Drag to explore
        </span>
      </div>
    </div>
  );
};

export default RadialSlider;
