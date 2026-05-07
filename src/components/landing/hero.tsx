"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const words = ["BIG", "AMAZING", "WONDERFUL", "MARVELLOUS", "INCREDIBLE"];

export function Hero() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      // Typing effect - faster speedmin
      if (displayedText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, displayedText.length + 1));
        }, 80); // Reduced from 150ms to 80ms
      } else {
        // Wait before starting to delete - shorter wait
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 1500); // Reduced from 2000ms to 1500ms
      }
    } else {
      // Deleting effect - faster speed
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 60); // Reduced from 100ms to 60ms
      } else {
        // Move to next word
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isTyping, currentWordIndex]);

  return (
    <section className="text-center px-4 min-h-screen flex flex-col items-center justify-center pt-20 pb-10">
      <div className="flex items-center justify-center mb-6">
        <h1 className="text-white font-bold text-4xl sm:text-6xl max-w-4xl mx-auto leading-[1.1] sm:leading-tight tracking-tight">
          SHOWCASE AND COLLABORATE ON YOUR NEXT{" "}
          <span className="relative inline-block">
            <motion.span
              className="text-primary inline-block min-w-[20px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {displayedText}
            </motion.span>
            <motion.span
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-[0.8em] sm:h-[0.9em] bg-primary"
              animate={{ opacity: [1, 0, 1] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </span>{" "}
          PROJECT
        </h1>
      </div>
      <p className="text-base sm:text-lg text-slate-400 tracking-wide max-w-xl mx-auto px-2">
        Talas is a platform to showcase your projects, receive feedback, and
        collaborate with other creators.
      </p>
      <Button className="mt-10" onClick={() => (location.href = "/feeds")}>
        Explore Talas
      </Button>
    </section>
  );
}