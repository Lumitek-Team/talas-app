"use client";

import React from "react";

type ImageContainerProps = {
  images: string[]; // Asumsi: setiap image adalah URL string
};

export function ImageContainerProjectProfile({ images }: ImageContainerProps) {
  const imageCount = images.length;

  const getImageClass = () => {
    if (imageCount === 1) return "w-full max-w-3xl aspect-video";
    if (imageCount === 2) return "w-full aspect-video";
    return "w-90 aspect-video"; // 3+ gambar
  };

  const isCarouselActive = imageCount >= 3;

  if (imageCount === 2) {
    // Untuk 2 gambar: grid 2 kolom
    return (
      <div className="grid grid-cols-2 gap-2 w-full pt-2 pb-2">
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Image ${idx + 1}`}
            className={`${getImageClass()} object-contain rounded-sm`}
          />
        ))}
      </div>
    );
  }

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
        className={`flex gap-2 pt-2 pb-2 ${
          isCarouselActive ? "w-max" : "w-full justify-center"
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
            className={`${getImageClass()} object-contain rounded-sm flex-shrink-0`}
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
