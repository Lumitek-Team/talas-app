"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link"; // Add this import
import { motion, Variants } from "framer-motion";
import { memo } from "react";

// Container variant for staggered children animation
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Increased for better visibility
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const teamMemberVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Team member component with variants
const TeamMember = memo(({ member }: { member: { id: number; image: string } }) => (
  <motion.div 
    className="w-44 h-52 rounded-3xl bg-gray-700/50 overflow-hidden group relative"
    variants={teamMemberVariants}
  >
    <Image
      src={member.image}
      alt={`Team member ${member.id}`}
      width={176}
      height={208}
      className="w-full h-full object-cover filter blur-sm grayscale hover:filter-none hover:scale-110 transition-all duration-300 ease-out"
      loading="lazy"
      priority={false}
      quality={75}
    />
  </motion.div>
));

TeamMember.displayName = 'TeamMember';

export function CTA() {
  const teamMembers = [
    { id: 1, image: "/team/member1.jpeg" },
    { id: 2, image: "/team/member2.jpeg" },
    { id: 3, image: "/team/member3.jpeg" },
    { id: 4, image: "/team/member4.jpeg" },
    { id: 5, image: "/team/member5.jpeg" },
  ];

  return (
    <motion.section 
      className="text-center py-50 px-4 bg-bg-primary relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-100px" }}
    >
      {/* Static background */}
      <div 
        className="absolute inset-0 z-0 opacity-50" 
        style={{ 
          backgroundImage: 'url("/img/aboutPage-bg.svg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <motion.h2 
          className="text-4xl text-white font-bold mb-16"
          variants={itemVariants}
        >
          Behind Talas
        </motion.h2>
        
        {/* Team members container */}
        <motion.div 
          className="flex justify-center gap-6 mb-16 flex-wrap"
          variants={containerVariants}
        >
          {teamMembers.map((member) => (
            <TeamMember key={member.id} member={member} />
          ))}
        </motion.div>
        
        <motion.p 
          className="text-slate-400 tracking-wide mb-12 max-w-3xl mx-auto text-lg"
          variants={itemVariants}
        >
          Meet the minds behind Talas—a team of developers and designers passionate about collaboration,
          innovation, and building a thriving tech community.
        </motion.p>
        
        <motion.div
          variants={itemVariants}
        >
          <Button onClick={() => window.location.href = "/about"}>
            About
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}