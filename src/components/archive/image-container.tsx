"use client";

import React from "react";

type ImageContainerProps = {
  images: string[];
};

export function ImageContainer({ images }: ImageContainerProps) {
  const isCarouselActive = images.length > 1;

  return (
    <div
      className={`w-full rounded-md overflow-hidden ${
        isCarouselActive ? "overflow-x-auto" : ""
      }`}
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <div
        className={`flex gap-2 ${
          isCarouselActive ? "w-[690]" : "w-full justify-center"
        }`}
        style={{
          overflowX: isCarouselActive ? "scroll" : "hidden",
        }}
      >
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Image ${idx + 1}`}
            className="w-full max-w-[100vw] aspect-video object-contain rounded-sm flex-shrink-0"
          />
        ))}
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
