"use client";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="text-center py-20 px-4">
      <h1 className="text-white font-bold text-5xl sm:text-6xl max-w-4xl mx-auto mb-8"> {/* Added mb-8 */}
        SHOWCASE AND COLLABORATE ON YOUR NEXT BIG PROJECT
      </h1>
      <p className="mt-8 text-lg text-slate-400 tracking-wide max-w-xl mx-auto"> {/* Changed mt-4 to mt-8 */}
        Talas is a platform to showcase your projects, receive feedback, and collaborate with other creators.
      </p>
      <Button className="mt-10" onClick={() => (location.href = "/feeds")}> {/* Changed mt-6 to mt-10 */}
        Get Started
      </Button>
    </section>
  );
}
