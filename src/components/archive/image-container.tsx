"use client";

import React from "react";
import Image from "next/image";
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
        <Image
          src={images[0]}
          alt="Project Image"
          width={800}
          height={450}
          className="w-full aspect-video object-cover bg-white rounded-sm"
          unoptimized
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
              <Image
                src={src}
                alt={`Image ${idx + 1}`}
                width={800}
                height={450}
                className="w-full aspect-video object-cover bg-white"
                unoptimized
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
