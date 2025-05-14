"use client"

import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/landing/hero";
import { TechIcons } from "@/components/landing/techIcons";
import { Preview } from "@/components/landing/preview";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/layout/footer";

export default function LandingPage() {
  return (
    <main
      className="bg-bg-primary min-h-screen font-sans relative"
      style={{
        backgroundImage: "url('/img/landingPage-bg2.jpg')",
        backgroundSize: "110%",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div className="relative z-10">
        <Navbar />
        <div className="pt-28 md:pt-32">
          <Hero />
          <TechIcons />
          <Preview />
          <CTA />
          <Footer />
        </div>
      </div>
    </main>
  );
}
