import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

interface SliderCard {
  id: number;
  title: string;
  description: string;
  imagePlaceholder: string;
}

interface RadialSliderProps {
  cards: SliderCard[];
}

const CARD_WIDTH = 360;
const CARD_HEIGHT = 500;

const RadialSlider = ({ cards }: RadialSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const rafRef = useRef<number>(0);

  const totalCards = cards.length;
  const arcSpan = 18;

  const positionCards = useCallback(
    (rotation: number) => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      const radius = Math.max(containerWidth * 0.9, 800);
      const centerX = containerWidth / 2;
      const centerY = radius + containerHeight * 0.05 + CARD_HEIGHT / 2;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        const totalSpan = (totalCards - 1) * arcSpan;
        // Base angle for this card
        const baseAngle = -90 - totalSpan / 2 + i * arcSpan + rotation;
        
        // Wrap the angle into infinite loop using modulo
        const fullCircle = totalCards * arcSpan;
        let wrappedOffset = ((baseAngle + 90 + totalSpan / 2) % fullCircle + fullCircle) % fullCircle;
        // Re-center so cards distribute around -90 degrees
        const angle = -90 - totalSpan / 2 + wrappedOffset;

        const rad = (angle * Math.PI) / 180;

        const x = centerX + radius * Math.cos(rad) - CARD_WIDTH / 2;
        const y = centerY + radius * Math.sin(rad) - CARD_HEIGHT / 2;

        const tilt = angle + 90;

        const normalizedAngle = Math.abs(((angle + 90) % 360 + 360) % 360);
        const absAngle = normalizedAngle > 180 ? 360 - normalizedAngle : normalizedAngle;
        const scale = gsap.utils.mapRange(0, 60, 1, 0.55, Math.min(absAngle, 60));
        const opacity = gsap.utils.mapRange(0, 60, 1, 0.15, Math.min(absAngle, 60));

        gsap.set(card, {
          x,
          y,
          rotation: tilt,
          scale,
          opacity,
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

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      gsap.killTweensOf(rotationRef);
      cancelAnimationFrame(rafRef.current);

      rotationRef.current -= e.deltaY * 0.06;
      positionCards(rotationRef.current);

      gsap.delayedCall(0.4, snapToNearest);
    };
    container.addEventListener("wheel", handleWheel, { passive: false });

    const handleResize = () => positionCards(rotationRef.current);
    window.addEventListener("resize", handleResize);

    return () => {
      draggable[0]?.kill();
      proxy.remove();
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("wheel", handleWheel);
      cancelAnimationFrame(rafRef.current);
    };
  }, [positionCards, snapToNearest]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{
        height: "clamp(550px, 75vh, 900px)",
        touchAction: "none",
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
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            padding: "1rem",
            willChange: "transform",
          }}
        >
          <div
            className="slider-card__image mb-5 flex items-center justify-center w-full"
            style={{
              height: "55%",
              backgroundColor: "hsl(var(--slider-card-fg) / 0.08)",
            }}
          >
            <span className="slider-card__text text-3xl">
              {card.imagePlaceholder}
            </span>
          </div>

          <div className="flex flex-col gap-2 px-1 text-center w-full">
            <h3 className="slider-card__title text-xl">{card.title}</h3>
            <p className="slider-card__text text-sm">{card.description}</p>
          </div>
        </div>
      ))}

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <span className="text-xs tracking-widest uppercase text-muted-foreground opacity-60">
          Drag to explore
        </span>
      </div>
    </div>
  );
};

export default RadialSlider;
