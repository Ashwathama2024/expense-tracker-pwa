"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

import { formatCurrency } from "@/lib/utils";

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    if (from === value) return;
    const controls = animate(from, value, {
      duration: 0.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    prevRef.current = value;
    return () => controls.stop();
  }, [value]);

  return <span className={className}>{formatCurrency(display)}</span>;
}
