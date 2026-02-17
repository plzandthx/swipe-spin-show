import { useState, useEffect, useRef, type RefObject } from "react";

interface UseTypewriterOptions {
  text: string;
  speed?: number;          // ms per character (default 80)
  cursorHideDelay?: number; // ms after typing finishes to hide cursor (default 3000)
  ref: RefObject<HTMLElement | null>; // element to observe for viewport entry
}

interface UseTypewriterReturn {
  displayText: string;
  showCursor: boolean;
  isTyping: boolean;
}

export function useTypewriter({
  text,
  speed = 80,
  cursorHideDelay = 3000,
  ref,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [started, setStarted] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [cursorHidden, setCursorHidden] = useState(false);
  const blinkRef = useRef<ReturnType<typeof setInterval>>();
  const hideRef = useRef<ReturnType<typeof setTimeout>>();

  const isTyping = started && charIndex < text.length;

  // Wait for element to enter viewport before starting
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  // Type characters one by one (only after started)
  useEffect(() => {
    if (!started || charIndex >= text.length) return;
    const timer = setTimeout(() => {
      setCharIndex((prev) => prev + 1);
    }, speed);
    return () => clearTimeout(timer);
  }, [started, charIndex, text.length, speed]);

  // Blinking cursor (only after started)
  useEffect(() => {
    if (!started) return;
    blinkRef.current = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(blinkRef.current);
  }, [started]);

  // Hide cursor after typing completes
  useEffect(() => {
    if (!started || charIndex < text.length) return;
    hideRef.current = setTimeout(() => {
      setCursorHidden(true);
    }, cursorHideDelay);
    return () => clearTimeout(hideRef.current);
  }, [started, charIndex, text.length, cursorHideDelay]);

  return {
    displayText: started ? text.slice(0, charIndex) : "",
    showCursor: started && !cursorHidden && cursorVisible,
    isTyping,
  };
}
