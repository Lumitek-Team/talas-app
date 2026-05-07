"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TeamCard } from "@/components/ui/team-card";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { motion, useScroll, useTransform, useSpring, Variants, LayoutGroup } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";

// ---------------------------------------------------------------------------
// Motion config
// ---------------------------------------------------------------------------

// Spring preset — used everywhere for physical feel
const SPRING = {
  type: "spring" as const,
  stiffness: 80,
  damping: 20,
  mass: 0.8,
};


// No scale — avoids text blur on non-retina displays
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const teamMemberVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING, stiffness: 100, damping: 22 },
  },
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const teamMembers = [
  {
    id: 1,
    name: "Rafi Nazhmi N",
    role: "Project Manager",
    image: "/team/member1.jpeg",
    description:
      "A highly organized and communicative Project Manager with experience leading cross-functional teams and ensuring timely, goal-oriented project execution.",
    social: {
      instagram: "https://www.instagram.com/rafnazhm",
      linkedin: "https://www.linkedin.com/in/rafi-nazhmi-nugraha",
      github: "https://github.com/rafinazhminugraha",
    },
  },
  {
    id: 2,
    name: "M Padli Septiana",
    role: "Backend Developer",
    image: "/team/member2.jpeg",
    description:
      "I am the Soulflame Igniter of Servers, commanding the machine's essence from the shadow dimension. Every system bows to my will, for I am the unstoppable primordial force, the puppeteer behind reality's veil..",
    social: {
      instagram: "https://www.instagram.com/septian_padli",
      linkedin: "https://www.linkedin.com/in/muhammad-padli-septiana",
      github: "https://github.com/septian-padli",
    },
  },
  {
    id: 3,
    name: "M Shandy Winata",
    role: "Backend Developer",
    image: "/team/member3.jpeg",
    description:
      "A lifelong learner with a passion for building robust systems, actively diving into the world of backend development and keen to master its intricacies.",
    social: {
      instagram: "https://www.instagram.com/altrnt.if",
      linkedin: "https://www.linkedin.com/in/mshandywinata",
      github: "https://github.com/mshandywinata",
    },
  },
  {
    id: 4,
    name: "Gregorius Christian S",
    role: "Frontend Developer",
    image: "/team/member4.jpeg",
    description:
      "I'm Gregorius Christian Sunaryo, a web developer currently diving deep into frontend development. I'm passionate about creating responsive, user-friendly, and visually appealing interfaces.",
    social: {
      instagram: "https://www.instagram.com/g_christian_s",
      linkedin:
        "https://www.linkedin.com/in/gregoriuschristiansunaryo?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      github: "https://github.com/gchristiansun",
    },
  },
  {
    id: 5,
    name: "Nidda Adzliya N",
    role: "UI UX Designer",
    image: "/team/member5.jpeg",
    description:
      "Designs intuitive and visually appealing user interfaces that blend creativity with usability, ensuring every user interaction feels natural and engaging on Talas",
    social: {
      instagram: "https://www.instagram.com/adzkyyaan",
      linkedin: "https://www.linkedin.com/in/nidda-adzkya-nurfitria",
      github: "https://github.com/adzkyya",
    },
  },
];

// ---------------------------------------------------------------------------
// Viewport config — once: true prevents re-fire on scroll-back
// ---------------------------------------------------------------------------
const VIEWPORT = { once: true, margin: "-80px" } as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Smooth the raw scroll value before feeding it to transforms
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });

  const overlayOpacity = useTransform(smoothProgress, [0, 0.5], [0.45, 0.78]);
  const bgScale = useTransform(smoothProgress, [0, 1], [1, 1.06]);

  const handleExpand = (id: number) => setExpandedCardId(id);
  const handleCollapse = () => setExpandedCardId(null);

  return (
    <main
      ref={containerRef}
      className="bg-bg-primary min-h-screen font-sans relative overflow-hidden cursor-none"
    >
      <SmoothCursor />

      {/* Background image — subtle parallax scale */}
      <motion.div
        className="fixed inset-0 z-0"
        style={{ scale: bgScale }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/img/landingPage-bg2.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </motion.div>

      {/* Scroll-driven overlay */}
      <motion.div
        className="fixed inset-0 bg-black z-0"
        style={{ opacity: overlayOpacity }}
      />

      <div className="relative z-10">
        {/* Navbar */}
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...SPRING, stiffness: 100, damping: 24 }}
        >
          <Navbar />
        </motion.div>

        <div className="pt-32 pb-20">
          {/* Logo */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="mb-16 px-4"
          >
            <motion.div variants={fadeUp} className="flex justify-center">
              <Image
                src="/logo/talas-logo.png"
                alt="Talas Logo"
                width={80}
                height={80}
                className="h-20 w-auto"
              />
            </motion.div>
          </motion.div>

          {/* About Talas */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="mb-24 px-4"
          >
            <motion.div variants={fadeUp} className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl text-white font-bold mb-8">
                About Talas
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Talas is more than just a platform. It&apos;s a growing ecosystem
                built by passionate developers and designers, aiming to foster
                collaboration, creativity, and meaningful connections through
                technology. With Talas, we envision a space where software
                projects are not only shared — but celebrated, improved, and
                co-created.
              </p>
            </motion.div>
          </motion.div>

          {/* Our Story */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="mb-24 px-4"
          >
            <motion.div variants={fadeUp} className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl text-white font-bold mb-8">
                Our Story
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Talas was born from the need to provide a dedicated space for
                software developers to showcase their projects in a more
                structured and engaging way. We combine professional presentation
                with a social media vibe, making it easier for developers to
                share, collaborate, and find inspiration within an active and
                creative community.
              </p>
            </motion.div>
          </motion.div>

          {/* Meet Our Team */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="mb-20 px-6 lg:px-12"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl text-white font-bold text-center mb-16"
            >
              Meet our team
            </motion.h2>

            {/*
              LayoutGroup lets Framer Motion coordinate layout animations
              across sibling TeamCards so expansion feels connected, not isolated.
            */}
            <LayoutGroup>
              <div className="max-w-7xl mx-auto">

                {/* Mobile: vertical stack */}
                <div className="block md:hidden">
                  <div className="flex flex-col gap-6 items-center px-4">
                    {teamMembers.map((member) => (
                      <TeamCard
                        key={member.id}
                        member={member}
                        variants={teamMemberVariants}
                        isAnyExpanded={expandedCardId !== null}
                        isExpanded={expandedCardId === member.id}
                        onExpand={handleExpand}
                        onCollapse={handleCollapse}
                      />
                    ))}
                  </div>
                </div>

                {/* Tablet: 3 + 2 grid */}
                <div className="hidden md:block lg:hidden">
                  <div className="grid grid-cols-3 gap-6 justify-items-center px-8">
                    {teamMembers.slice(0, 3).map((member) => (
                      <TeamCard
                        key={member.id}
                        member={member}
                        variants={teamMemberVariants}
                        isAnyExpanded={expandedCardId !== null}
                        isExpanded={expandedCardId === member.id}
                        onExpand={handleExpand}
                        onCollapse={handleCollapse}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-6 justify-items-center mt-8 px-8">
                    {teamMembers.slice(3).map((member) => (
                      <TeamCard
                        key={member.id}
                        member={member}
                        variants={teamMemberVariants}
                        isAnyExpanded={expandedCardId !== null}
                        isExpanded={expandedCardId === member.id}
                        onExpand={handleExpand}
                        onCollapse={handleCollapse}
                      />
                    ))}
                  </div>
                </div>

                {/*
                  Desktop: natural-height flex row.
                  REMOVED the fixed h-[300px] — it was fighting card expansion
                  and forcing overflow-visible to do impossible work.
                  min-h keeps baseline visual rhythm; py-8 gives expansion room.
                */}
                <div className="hidden lg:flex gap-8 justify-center items-start min-h-[300px] py-8 px-12">
                  {teamMembers.map((member) => (
                    <TeamCard
                      key={member.id}
                      member={member}
                      variants={teamMemberVariants}
                      isAnyExpanded={expandedCardId !== null}
                      isExpanded={expandedCardId === member.id}
                      onExpand={handleExpand}
                      onCollapse={handleCollapse}
                    />
                  ))}
                </div>

              </div>
            </LayoutGroup>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={SPRING}
          viewport={{ once: true, margin: "-40px" }}
        >
          <Footer />
        </motion.div>
      </div>
    </main>
  );
}