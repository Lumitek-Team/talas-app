"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Hero() {
  const words = ["BIG", "AMAZING", "WONDERFUL", "MARVELLOUS", "INCREDIBLE"];
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
  }, [displayedText, isTyping, currentWordIndex, words]);

  return (
    <section className="mb-65 text-center py-30 px-4">
      <h1 className="text-white font-bold text-5xl sm:text-6xl max-w-4xl mx-auto mb-8">
        SHOWCASE AND COLLABORATE ON YOUR NEXT{" "}
        <motion.span
          className="text-primary inline-block min-w-[80px] sm:min-w-[10px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {displayedText}
          <motion.span
            className="inline-block w-1 h-12 sm:h-16 bg-primary ml-1"
            animate={{ opacity: [1, 0, 1] }}
            transition={{
              duration: 0.8, // Slightly faster cursor blink
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.span>{" "}
        PROJECT
      </h1>
      <p className="mt-8 text-lg text-slate-400 tracking-wide max-w-xl mx-auto">
        Talas is a platform to showcase your projects, receive feedback, and
        collaborate with other creators.
      </p>
      <Button className="mt-10" onClick={() => (location.href = "/feeds")}>
        Get Started
      </Button>
    </section>
  );
}