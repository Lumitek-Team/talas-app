"use client";

import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/landing/hero";
import { TechIcons } from "@/components/landing/techIcons";
import { Preview } from "@/components/landing/preview";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/layout/footer";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useRef } from "react";

// Animation variants with proper typing
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

const fadeInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 100,
    rotateY: -15
  },
  visible: { 
    opacity: 1, 
    x: 0,
    rotateY: 0,
    transition: { 
      duration: 0.9,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const fadeInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -100,
    rotateY: 15
  },
  visible: { 
    opacity: 1, 
    x: 0,
    rotateY: 0,
    transition: { 
      duration: 0.9,
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

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Only keep overlay opacity effect
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 0.8]);

  return (
    <main 
      ref={containerRef}
      className="bg-bg-primary min-h-screen font-sans relative overflow-hidden"
    >
      {/* Static Background (no parallax) */}
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

      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="fixed top-20 left-10 w-4 h-4 bg-primary rounded-full opacity-30 z-5"
      />
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="fixed top-40 right-20 w-6 h-6 bg-blue-500 rounded-full opacity-20 z-5"
      />
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="fixed bottom-20 left-1/4 w-5 h-5 bg-green-500 rounded-full opacity-25 z-5"
      />
      
      <div className="relative z-10">
        {/* Navbar with entrance animation */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Navbar />
        </motion.div>

        <div className="pt-28 md:pt-32">
          {/* Hero Section - Changed to use whileInView for re-entering animation */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ margin: "-100px" }} // Added viewport with re-animation
            className="mb-20 md:mb-32"
          >
            <motion.div variants={fadeInUp}>
              <Hero />
            </motion.div>
          </motion.div>

          {/* Tech Icons without reveal animation */}
          <div className="mb-100 md:mb-90">
            <TechIcons />
          </div>

          {/* Preview Section with repeatable animation */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ margin: "-100px" }}
            className="mb-24 md:mb-40"
          >
            <Preview />
          </motion.div>

          {/* CTA Section */}
          <div className="mb-20 md:mb-32">
            <CTA />
          </div>

          {/* Footer with repeatable animation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ 
              opacity: 1, 
              y: 0
            }}
            transition={{ duration: 0.6 }}
            viewport={{ margin: "-50px" }}
          >
            <Footer />
          </motion.div>
        </div>
      </div>
    </main>
  );
}