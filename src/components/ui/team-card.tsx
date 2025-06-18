"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  description?: string;
  social: {
    instagram: string;
    linkedin: string;
    github: string;
  };
}

interface TeamCardProps {
  member: TeamMember;
  variants?: any;
  isAnyExpanded: boolean;
  isExpanded: boolean;
  onExpand: (id: number) => void;
  onCollapse: () => void;
}

export function TeamCard({ 
  member, 
  variants, 
  isAnyExpanded, 
  isExpanded, 
  onExpand, 
  onCollapse 
}: TeamCardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Detect device type
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768 || 'ontouchstart' in window);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Handle card interaction
  const handleCardInteraction = () => {
    if (isExpanded) {
      onCollapse();
    } else {
      onExpand(member.id);
    }
  };

  // Responsive dimensions
  const getCardDimensions = () => {
    if (isMobile) {
      return {
        normal: "240px",
        expanded: "240px", 
        shrunk: "200px",
        height: isExpanded ? "auto" : "212px"
      };
    } else if (isTablet) {
      return {
        normal: "200px",
        expanded: "440px", // Reduced from 500px to avoid edge overflow
        shrunk: "160px",
        height: "260px"
      };
    } else {
      return {
        normal: "240px",
        expanded: "600px",
        shrunk: "180px",
        height: "260px"
      };
    }
  };

  const getImageDimensions = () => {
    if (isMobile) {
      return {
        normal: "180px",
        expanded: "130px", // Smaller image when expanded to make room for content
        shrunk: "140px"
      };
    } else if (isTablet) {
      return {
        normal: "140px",
        expanded: "160px",
        shrunk: "100px"
      };
    } else {
      return {
        normal: "180px",
        expanded: "200px",
        shrunk: "108px"
      };
    }
  };

  const getLeftSectionWidth = () => {
    if (isMobile) {
      return {
        normal: "240px",
        expanded: "280px",
        shrunk: "200px"
      };
    } else if (isTablet) {
      return {
        normal: "200px",
        expanded: "240px",
        shrunk: "160px"
      };
    } else {
      return {
        normal: "240px",
        expanded: "280px",
        shrunk: "180px"
      };
    }
  };

  const getRightSectionWidth = () => {
    if (isMobile) {
      return "0px"; // No right section on mobile
    } else if (isTablet) {
      return isExpanded ? "260px" : "0px";
    } else {
      return isExpanded ? "320px" : "0px";
    }
  };

  const cardDims = getCardDimensions();
  const imageDims = getImageDimensions();
  const leftSectionDims = getLeftSectionWidth();

  // Modified card component handling in mobile view for smooth animations
  return (
    <motion.div
      variants={variants}
      className="relative overflow-hidden cursor-pointer flex-shrink-0"
      onClick={handleCardInteraction}
      onHoverStart={!isMobile ? () => onExpand(member.id) : undefined}
      onHoverEnd={!isMobile ? onCollapse : undefined}
      animate={{
        width: isExpanded ? cardDims.expanded : isAnyExpanded ? cardDims.shrunk : cardDims.normal,
        height: isMobile && isExpanded ? "auto" : cardDims.height,
        minHeight: isMobile && isExpanded ? "420px" : cardDims.height,
        zIndex: isExpanded ? 20 : 10,
      }}
      transition={{
        duration: 0.35,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {/* Card Background */}
      <motion.div
        className="bg-gray-800/30 rounded-3xl backdrop-blur-sm border border-gray-700/30 h-full relative overflow-hidden"
        animate={{
          borderColor: isExpanded ? "rgb(34 197 94 / 0.6)" : "rgb(55 65 81 / 0.3)",
        }}
        transition={{ duration: 0.25 }}
      >
        {/* Mobile Layout - Use consistent structure for both states */}
        {isMobile ? (
          <motion.div 
            className="flex flex-col items-center w-full h-full p-4" // Changed from p-5 to p-4 for consistent padding
            animate={{ height: isExpanded ? "auto" : "280px" }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Image with smooth animation */}
            <motion.div 
              animate={{ 
                scale: isExpanded ? 0.72 : 1,
                marginTop: isExpanded ? "2px" : "0px", // Changed from 10px to 8px to match other spacing
                marginBottom: isExpanded ? "16px" : "0px"
              }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div 
                className="relative"
                animate={{ 
                  width: isExpanded ? "130px" : "180px",
                  height: isExpanded ? "130px" : "180px"
                }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  width={220}
                  height={220}
                  className="w-full h-full object-cover rounded-2xl"
                />
                
                {/* Mobile tap indicator */}
                {!isExpanded && (
                  <motion.div 
                    className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
            
            {/* Expanded Content with conditional rendering but smooth animation */}
            <motion.div 
              className="flex flex-col items-center w-full px-2 text-center"
              initial={false}
              animate={{ 
                opacity: isExpanded ? 1 : 0,
                height: isExpanded ? "auto" : 0,
                marginTop: isExpanded ? 0 : -20
              }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              {/* Always render but conditionally show for smooth animation */}
              <h3 className="text-white font-bold text-lg mb-1">
                {member.name}
              </h3>
              <p className="text-primary text-sm font-medium mb-3">
                {member.role}
              </p>
              
              {/* Description */}
              {member.description && (
                <p className="text-slate-400 text-xs leading-relaxed mb-4 max-w-[210px]">
                  {member.description}
                </p>
              )}
              
              {/* Social Links */}
              <div className="flex gap-3 justify-center mb-4">
                <motion.a 
                  href={member.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center hover:bg-pink-500 transition-colors duration-300"
                  aria-label={`${member.name} Instagram`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
                  </svg>
                </motion.a>
                <motion.a 
                  href={member.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                  aria-label={`${member.name} LinkedIn`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </motion.a>
                <motion.a 
                  href={member.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors duration-300"
                  aria-label={`${member.name} GitHub`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </motion.a>
              </div>

              <p className="text-slate-500 text-xs mb-1">
                Tap again to collapse
              </p>
            </motion.div>
          </motion.div>
        ) : (
          // Desktop/tablet view
          <>
            {/* Left Section - Profile Image */}
            <motion.div 
              className="absolute left-0 top-0 h-full flex items-center justify-center p-4 md:p-6"
              animate={{
                width: isExpanded ? leftSectionDims.expanded : isAnyExpanded ? leftSectionDims.shrunk : leftSectionDims.normal,
              }}
              transition={{
                duration: 0.35,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {/* Profile Image - Always centered vertically */}
              <motion.div 
                className="relative flex-shrink-0"
                animate={{
                  width: isExpanded ? imageDims.expanded : isAnyExpanded ? imageDims.shrunk : imageDims.normal,
                  height: isExpanded ? imageDims.expanded : isAnyExpanded ? imageDims.shrunk : imageDims.normal,
                }}
                transition={{
                  duration: 0.35,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  width={220}
                  height={220}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </motion.div>
            </motion.div>

            {/* Right Section - Tablet/Desktop Expanded Content */}
            <motion.div
              className="absolute right-0 top-0 h-full"
              style={{ overflow: isExpanded ? 'visible' : 'hidden' }}
              animate={{
                width: getRightSectionWidth(),
                opacity: isExpanded ? 1 : 0,
              }}
              transition={{
                duration: 0.25,
                ease: [0.25, 0.46, 0.45, 0.94],
                opacity: { delay: isExpanded ? 0.1 : 0, duration: 0.2 }
              }}
            >
              {/* Content with responsive padding */}
              {isExpanded && (
                <div className="p-4 md:p-6 h-full flex flex-col justify-center">
                  {/* Expanded Member Info */}
                  <motion.div
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                      duration: 0.2,
                      delay: 0.1,
                      ease: "easeOut"
                    }}
                    className="text-left"
                  >
                    {/* Name and Role */}
                    <motion.div 
                      className="mb-4 md:mb-5"
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: 0.15,
                        ease: "easeOut"
                      }}
                    >
                      <h3 className="text-white font-bold text-lg md:text-xl mb-2">
                        {member.name}
                      </h3>
                      <p className="text-primary text-sm font-medium mb-3 md:mb-4">
                        {member.role}
                      </p>
                      
                      {/* Description - Responsive text size */}
                      {member.description && (
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 md:line-clamp-4">
                          {member.description}
                        </p>
                      )}
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        duration: 0.2,
                        delay: 0.2,
                        ease: "easeOut"
                      }}
                    >
                      <div className="flex gap-2 md:gap-3">
                        <motion.a 
                          href={member.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 md:w-10 md:h-10 bg-gray-700/50 rounded-xl flex items-center justify-center hover:bg-pink-500 transition-colors duration-300"
                          aria-label={`${member.name} Instagram`}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                          transition={{ duration: 0.1 }}
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
                          </svg>
                        </motion.a>
                        <motion.a 
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 md:w-10 md:h-10 bg-gray-700/50 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                          aria-label={`${member.name} LinkedIn`}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                          transition={{ duration: 0.1 }}
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </motion.a>
                        <motion.a 
                          href={member.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 md:w-10 md:h-10 bg-gray-700/50 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors duration-300"
                          aria-label={`${member.name} GitHub`}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                          transition={{ duration: 0.1 }}
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </motion.a>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Hover indicator for desktop/tablet */}
        {!isMobile && !isExpanded && (
          // Keep existing hover indicator code unchanged
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-200"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <div className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2">
              <motion.div
                className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}