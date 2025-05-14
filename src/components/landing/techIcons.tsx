"use client";
import Image from "next/image";

const tech = [
  { name: "Python", src: "/logo/python.svg" },
  { name: "Java", src: "/logo/java.svg" },
  { name: "JavaScript", src: "/logo/js.svg" },
  { name: "Figma", src: "/logo/figma.svg" },
  { name: "PHP", src: "/logo/php.svg" },
];

const duplicatedTech = [...tech, ...tech, ...tech];

export function TechIcons() {
  return (
    <div className="my-40 overflow-hidden w-full h-[160px]">
      <div className="flex animate-scroll whitespace-nowrap gap-40 min-w-[300%]">
        {duplicatedTech.map((t, i) => (
          <div
            key={i}
            className="inline-flex items-center justify-center flex-shrink-0 w-[140px] h-[140px] px-5"
          >
            <Image
              src={t.src}
              alt={t.name}
              width={140}
              height={140}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}