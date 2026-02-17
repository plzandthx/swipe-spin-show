import { useState, useEffect, useRef } from "react";

interface UseTypewriterOptions {
  text: string;
  speed?: number;          // ms per character (default 80)
  cursorHideDelay?: number; // ms after typing finishes to hide cursor (default 3000)
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
}: UseTypewriterOptions): UseTypewriterReturn {
  const [charIndex, setCharIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [cursorHidden, setCursorHidden] = useState(false);
  const blinkRef = useRef<ReturnType<typeof setInterval>>();
  const hideRef = useRef<ReturnType<typeof setTimeout>>();

  const isTyping = charIndex < text.length;

  // Type characters one by one
  useEffect(() => {
    if (charIndex >= text.length) return;
    const timer = setTimeout(() => {
      setCharIndex((prev) => prev + 1);
    }, speed);
    return () => clearTimeout(timer);
  }, [charIndex, text.length, speed]);

  // Blinking cursor while typing
  useEffect(() => {
    blinkRef.current = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(blinkRef.current);
  }, []);

  // Hide cursor after typing completes
  useEffect(() => {
    if (charIndex < text.length) return;
    hideRef.current = setTimeout(() => {
      setCursorHidden(true);
    }, cursorHideDelay);
    return () => clearTimeout(hideRef.current);
  }, [charIndex, text.length, cursorHideDelay]);

  return {
    displayText: text.slice(0, charIndex),
    showCursor: !cursorHidden && cursorVisible,
    isTyping,
  };
}
