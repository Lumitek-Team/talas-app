"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TeamCard } from "@/components/ui/team-card";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

// Animation variants
const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
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

// Team members data moved outside component
const teamMembers = [
  {
    id: 1,
    name: "Rafi Nazhmi Nugraha",
    role: "Project Manager",
    image: "/team/member1.jpeg",
    description: "A highly organized and communicative Project Manager with experience leading cross-functional teams and ensuring timely, goal-oriented project execution.",
    social: {
      instagram: "https://www.instagram.com/rafnazhm",
      linkedin: "https://www.linkedin.com/in/rafi-nazhmi-nugraha",
      github: "https://github.com/rafinazhminugraha"
    }
  },
  {
    id: 2,
    name: "M Padli Septiana",
    role: "Backend Developer",
    image: "/team/member2.jpeg",
    description: "I am the Soulflame Igniter of Servers, commanding the machine's essence from the shadow dimension. Every system bows to my will, for I am the unstoppable primordial force, the puppeteer behind reality's veil..",
    social: {
      instagram: "https://www.instagram.com/septian_padli",
      linkedin: "https://www.linkedin.com/in/muhammad-padli-septiana",
      github: "https://github.com/septian-padli"
    }
  },
  {
    id: 3,
    name: "M Shandy Winata",
    role: "Backend Developer",
    image: "/team/member3.jpeg",
    description: "A lifelong learner with a passion for building robust systems, actively diving into the world of backend development and keen to master its intricacies.",
    social: {
      instagram: "https://www.instagram.com/altrnt.if",
      linkedin: "https://www.linkedin.com/in/mshandywinata",
      github: "https://github.com/mshandywinata"
    }
  },
  {
    id: 4,
    name: "Gregorius Christian",
    role: "Frontend Developer",
    image: "/team/member4.jpeg",
    description: "I'm Gregorius Christian Sunaryo, a web developer currently diving deep into frontend development. I'm passionate about creating responsive, user-friendly, and visually appealing interfaces.",
    social: {
      instagram: "https://www.instagram.com/g_christian_s",
      linkedin: "https://www.linkedin.com/in/gregoriuschristiansunaryo?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      github: "https://github.com/gchristiansun"
    }
  },
  {
    id: 5,
    name: "Nidda Adzliya N",
    role: "UI UX Designer",
    image: "/team/member5.jpeg",
    description: "Designs intuitive and visually appealing user interfaces that blend creativity with usability, ensuring every user interaction feels natural and engaging on Talas",
    social: {
      instagram: "https://www.instagram.com/adzkyyaan",
      linkedin: "https://www.linkedin.com/in/nidda-adzkya-nurfitria",
      github: "https://github.com/adzkyya"
    }
  }
];

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Overlay opacity effect
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 0.8]);

  return (
    <main 
      ref={containerRef}
      className="bg-bg-primary min-h-screen font-sans relative overflow-hidden"
    >
      {/* Same background as landing page */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/img/landingPage-bg2.jpg')",
          backgroundSize: "cover", 
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      
      {/* Animated Overlay */}
      <motion.div 
        className="fixed inset-0 bg-black z-0"
        style={{
          opacity: overlayOpacity
        }}
      />

      <div className="relative z-10">
        {/* Navbar */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Navbar />
        </motion.div>

        <div className="pt-32 pb-20">
          {/* Logo Section */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            className="mb-16 px-4"
          >
            <motion.div 
              variants={fadeInUp}
              className="flex justify-center"
            >
              <Image
                src="/logo/talas-logo.png"
                alt="Talas Logo"
                width={80}
                height={80}
                className="h-20 w-auto"
              />
            </motion.div>
          </motion.div>

          {/* About Talas Section */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            className="mb-24 px-4"
          >
            <motion.div 
              variants={fadeInUp}
              className="max-w-6xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl text-white font-bold mb-8">
                About Talas
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Talas is more than just a platform.
                It's a growing ecosystem built by passionate developers and designers, aiming to foster collaboration, creativity,
                and meaningful connections through technology. With Talas, we envision a space where software projects are not
                only shared — but celebrated, improved, and co-created.
              </p>
            </motion.div>
          </motion.div>

          {/* Our Story Section */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            className="mb-24 px-4"
          >
            <motion.div 
              variants={fadeInUp}
              className="max-w-6xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl text-white font-bold mb-8">
                Our Story
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Talas was born from the need to provide a dedicated space for software developers to showcase their projects in a more
                structured and engaging way. We combine professional presentation with a social media vibe, making it easier for developers to
                share, collaborate, and find inspiration within an active and creative community.
              </p>
            </motion.div>
          </motion.div>

          {/* Meet Our Team Section */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            className="mb-20 px-4"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl text-white font-bold text-center mb-16"
            >
              Meet our team
            </motion.h2>

            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 justify-items-center">
                {teamMembers.map((member) => (
                  <TeamCard 
                    key={member.id} 
                    member={member} 
                    variants={teamMemberVariants}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ 
            opacity: 1, 
            y: 0
          }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, margin: "-50px" }}
        >
          <Footer />
        </motion.div>
      </div>
    </main>
  );
}