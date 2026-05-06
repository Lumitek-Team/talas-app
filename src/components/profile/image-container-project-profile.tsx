"use client";

import { useState } from "react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";


type ImageContainerProps = {
  images: string[];
};

export function ImageContainerProjectProfile({ images }: ImageContainerProps) {
  const [, setLoadedCount] = useState(0);

  const isCarouselActive = images.length > 1;

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full">
      {isCarouselActive ? (
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full max-w-full"
        >
          <CarouselContent className="h-auto">
            {images.map((src, idx) => (
              <CarouselItem
                key={idx}
                className="w-full aspect-video"
              >
                <Image
                  src={src}
                  alt={`Image ${idx + 1}`}
                  width={800}
                  height={450}
                  onLoad={() => setLoadedCount((prev) => prev + 1)}
                  className="w-full h-full object-cover rounded-sm bg-white"
                  unoptimized
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-1" />
          <CarouselNext className="right-1" />
        </Carousel>
      ) : (
        <div className="w-full aspect-video">
          <Image
            src={images[0]}
            alt="Single Image"
            width={800}
            height={450}
            onLoad={() => setLoadedCount((prev) => prev + 1)}
            className="w-full h-full object-cover rounded-sm bg-white"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
