"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;
    if (reducedMotion || from === value) return;

    const controls = animate(from, value, {
      duration: 0.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, reducedMotion]);

  const shown = reducedMotion ? value : display;
  return <span className={className}>{formatCurrency(shown)}</span>;
}
