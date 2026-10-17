"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type MotionRevealProps = {
  children: ReactNode;
  delayMs?: number;
  className?: string;
};

export default function MotionReveal({
  children,
  delayMs = 0,
  className = "",
}: MotionRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    element.dataset.motion = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.dataset.motion = "visible";
        observer.unobserve(element);
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`motion-reveal ${className}`}
      style={{ "--motion-delay": `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
