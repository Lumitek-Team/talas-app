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
    <div className="my-40 overflow-hidden w-full h-[120px]">
      <div className="flex animate-scroll whitespace-nowrap gap-40 min-w-[300%]">
        {duplicatedTech.map((t, i) => (
          <div key={i} className="inline-flex items-center px-5">
            <Image src={t.src} alt={t.name} width={100} height={100} />
          </div>
        ))}
      </div>
    </div>
  );
}
