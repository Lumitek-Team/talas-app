"use client";

import React, { useEffect, useRef, useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type ImageContainerProps = {
  images: string[];
};

export function ImageContainerProjectProfile({ images }: ImageContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isCarouselActive = images.length > 1;
  const [loadedCount, setLoadedCount] = useState(0);

  // Saat semua gambar sudah dimuat, scroll ke tengah
  useEffect(() => {
    if (!isCarouselActive || loadedCount !== images.length || !containerRef.current) return;

    const container = containerRef.current;
    const imagesEl = container.querySelectorAll("img");

    if (imagesEl.length === 0) return;

    const imageWidth = imagesEl[0].clientWidth;
    const gap = 16; // sesuai dengan `gap-4`
    const containerWidth = container.offsetWidth;

    const middleIndex = Math.floor(images.length / 2);
    const scrollLeft =
      middleIndex * (imageWidth + gap) - containerWidth / 2 + imageWidth / 2;

    container.scrollTo({
      left: scrollLeft,
      behavior: "smooth",
    });
  }, [loadedCount, images.length, isCarouselActive]);

  return (
    <ScrollArea className="w-full rounded-md overflow-hidden">
      <div
        ref={containerRef}
        className={`flex gap-4 pt-2 pb-2 transition-all ${
          isCarouselActive ? "w-max" : "w-full justify-center"
        }`}
      >
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Image ${idx + 1}`}
            onLoad={() => setLoadedCount((prev) => prev + 1)}
            className="aspect-video h-auto w-full max-w-none rounded-sm object-contain bg-white"
          />
        ))}
      </div>
      {isCarouselActive && <ScrollBar orientation="horizontal" />}
    </ScrollArea>
  );
}
