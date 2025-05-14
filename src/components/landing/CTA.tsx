"use client";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="text-center py-16 px-4">
      <h2 className="text-2xl text-white font-semibold mb-4">Behind Talas</h2>
      <p className="text-text-secondary mb-6 max-w-lg mx-auto">
        Meet the minds behind Talas—a team of developers and designers passionate about collaboration,
        innovation, and building a thriving tech community.
      </p>
      <Button variant="link" onClick={() => (location.href = "/about")}>
        About
      </Button>
    </section>
  );
}