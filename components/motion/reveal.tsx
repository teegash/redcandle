"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}

export function Reveal({ children, delay = 0, y = 24 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(ref.current, { opacity: 1, y: 0 });
      return;
    }

    const animation = gsap.fromTo(
      ref.current,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        delay,
        duration: 0.8,
        ease: "power3.out",
      },
    );

    return () => {
      animation.kill();
    };
  }, [delay, y]);

  return <div ref={ref}>{children}</div>;
}
