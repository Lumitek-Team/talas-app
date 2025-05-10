"use client";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="text-center py-20 px-4">
      <h1 className="text-white font-bold text-4xl sm:text-6xl max-w-4xl mx-auto">
        SHOWCASE AND COLLABORATE ON YOUR NEXT BIG PROJECT
      </h1>
      <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
        Talas is a platform to showcase your projects, receive feedback, and collaborate with other creators.
      </p>
      <Button variant="link" className="mt-6" onClick={() => (location.href = "/feeds")}>
        Get Started
      </Button>
    </section>
  );
}
