"use client";
import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 50,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Set initial styles
    let translateValue = "";
    switch (direction) {
      case "up":
        translateValue = `translateY(${distance}px)`;
        break;
      case "down":
        translateValue = `translateY(-${distance}px)`;
        break;
      case "left":
        translateValue = `translateX(${distance}px)`;
        break;
      case "right":
        translateValue = `translateX(-${distance}px)`;
        break;
      case "none":
        translateValue = "none";
        break;
    }

    element.style.opacity = "0";
    element.style.transform = translateValue;
    element.style.transition = `opacity 0.8s ease-out, transform 0.8s ease-out`;
    element.style.transitionDelay = `${delay}ms`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is in view
            setTimeout(() => {
              element.style.opacity = "1";
              element.style.transform = "translateY(0) translateX(0)";
            }, 100);
            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px 0px -50px 0px", // Adjust when the animation triggers
      }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [delay, direction, distance]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}