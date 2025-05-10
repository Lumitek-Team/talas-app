import Image from "next/image";

const tech = [
  { name: "Python", src: "/logo/python.svg" },
  { name: "Java", src: "/logo/java.svg" },
  { name: "JavaScript", src: "/logo/js.svg" },
  { name: "Figma", src: "/logo/figma.svg" },
  { name: "PHP", src: "/logo/php.svg" },
];

export function TechIcons() {
  return (
    <div className="flex justify-center gap-12 py-8">
      {tech.map((t) => (
        <div key={t.name} className="flex flex-col items-center">
          <Image src={t.src} alt={t.name} width={32} height={32} />
        </div>
      ))}
    </div>
  );
}
