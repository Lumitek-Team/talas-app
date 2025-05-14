"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function CTA() {
  const teamMembers = [
    { id: 1, image: "/team/member1.jpeg" },
    { id: 2, image: "/team/member2.jpeg" },
    { id: 3, image: "/team/member3.jpeg" },
    { id: 4, image: "/team/member4.jpeg" },
    { id: 5, image: "/team/member5.jpeg" },
  ];

  return (
    <section className="text-center py-50 px-4 bg-bg-primary relative overflow-hidden">
      {/* Background SVG */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: 'url("/img/aboutPage-bg.svg")' }}
      ></div>

      {/* Content with higher z-index to appear above background */}
      <div className="relative z-10">
        <ScrollReveal distance={20}>
          <h2 className="text-4xl text-white font-bold mb-16">Behind Talas</h2>
        </ScrollReveal>

        <div className="flex justify-center gap-6 mb-16 flex-wrap">
          {/* Render team members in a single ScrollReveal to reduce observers */}
          <ScrollReveal distance={15}>
            <div className="flex justify-center gap-6 flex-wrap">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="w-44 h-52 rounded-3xl bg-gray-700/50 overflow-hidden group relative"
                >
                  <Image
                    src={member.image}
                    alt={`Team member ${member.id}`}
                    width={176}
                    height={208}
                    className="w-full h-full object-cover transition duration-250 ease-in-out transform filter blur-sm grayscale group-hover:filter-none group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal distance={15} delay={100}>
          <p className="text-slate-400 tracking-wide mb-12 max-w-3xl mx-auto text-lg">
            Meet the minds behind Talas—a team of developers and designers passionate about collaboration,
            innovation, and building a thriving tech community.
          </p>
        </ScrollReveal>

        <ScrollReveal distance={10} delay={150}>
          <Button onClick={() => (location.href = "/about")}>
            About
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}