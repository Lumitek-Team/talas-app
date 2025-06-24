"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type ImageContainerProps = {
  images: string[];
};

export function ImageContainer({ images }: ImageContainerProps) {
  const isCarouselActive = images.length > 1;

  if (!isCarouselActive) {
    return (
      <div className="w-full rounded-md overflow-hidden">
        <img
          src={images[0]}
          alt="Project Image"
          className="w-full aspect-video object-cover bg-white rounded-sm"
        />
      </div>
    );
  }

  return (
    <Carousel className="w-full max-w-full">
      <CarouselContent>
        {images.map((src, idx) => (
          <CarouselItem
            key={idx}
            className="basis-full sm:basis-[80%] md:basis-[60%] lg:basis-[50%]"
          >
            <div className="overflow-hidden rounded-sm">
              <img
                src={src}
                alt={`Image ${idx + 1}`}
                className="w-full aspect-video object-cover bg-white"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
