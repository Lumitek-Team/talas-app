"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function CTA() {
  const teamMembers = [
    { id: 1, image: "/team/member1.jpeg" },
    { id: 2, image: "/team/member2.jpeg" },
    { id: 3, image: "/team/member3.jpeg" },
    { id: 4, image: "/team/member4.jpeg" },
    { id: 5, image: "/team/member5.jpeg" },
  ];

  return (
    <section className="text-center py-50 px-4 bg-bg-primary"> {/* Changed py-24 to py-32 */}
      <h2 className="text-4xl text-white font-bold mb-16">Behind Talas</h2>
      
      <div className="flex justify-center gap-6 mb-16 flex-wrap">
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
            />
          </div>
        ))}
      </div>
      
      <p className="text-slate-400 tracking-wide mb-12 max-w-3xl mx-auto text-lg">
        Meet the minds behind Talas—a team of developers and designers passionate about collaboration,
        innovation, and building a thriving tech community.
      </p>
      
      <Button onClick={() => (location.href = "/about")}>
        About
      </Button>
    </section>
  );
}