"use client";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

const tech = [
  { name: "Python", src: "/logo/python.svg" },
  { name: "Java", src: "/logo/java.svg" },
  { name: "JavaScript", src: "/logo/js.svg" },
  { name: "Figma", src: "/logo/figma.svg" },
  { name: "PHP", src: "/logo/php.svg" },
];

const duplicatedTech = [...tech, ...tech, ...tech];

export function TechIcons() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Increased animation speed - changed from [0, -400] to [0, -1200]
  const x1 = useTransform(scrollYProgress, [0, 1], [0, -800]);

  // Faster spring physics for more responsive animation
  const smoothX1 = useSpring(x1, { stiffness: 150, damping: 25, mass: 0.8 });

  return (
    <div
      ref={containerRef}
      className="my-40 overflow-hidden w-full h-[160px] relative"
    >
      {/* Single row */}
      <motion.div
        className="flex whitespace-nowrap gap-20 min-w-[200%] items-center h-full"
        style={{ x: smoothX1 }}
      >
        {duplicatedTech.map((t, i) => (
          <motion.div
            key={`tech-${i}`}
            className="inline-flex items-center justify-center flex-shrink-0 w-[120px] h-[120px] px-3"
            whileHover={{
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.2 },
            }}
          >
            <Image
              src={t.src}
              alt={t.name}
              width={120}
              height={120}
              className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}