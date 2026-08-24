"use client"

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Frame from "@/public/frame (1).jpg";
import Frame1 from "@/public/frame (1).png";
import Frame2 from "@/public/frame (2).png";
import Frame3 from "@/public/frame (3).png";
import type { StaticImageData } from "next/image";

export default function AnimateCard() {
  const images: StaticImageData[] = [Frame, Frame1, Frame2, Frame3];
  const sectionRef = useRef(null);

  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Track hover state via a counter to avoid flicker
  // when cursor moves between overlapping cards
  const hoverCountRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleCardHoverStart = () => {
    hoverCountRef.current++;
    setIsHovered(true);
  };

  const handleCardHoverEnd = () => {
    hoverCountRef.current--;
    // Only collapse when cursor has left ALL cards
    if (hoverCountRef.current <= 0) {
      hoverCountRef.current = 0;
      setIsHovered(false);
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ Determine animation state:
  // - Mobile: trigger on scroll into view
  // - Desktop: trigger on card hover
  const animateState = isMobile
    ? isInView ? "hover" : "rest"
    : isHovered ? "hover" : "rest";

  return (
    <div ref={sectionRef} className="flex h-screen w-screen items-center justify-center">
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        initial="rest"
        // ✅ Removed whileHover from parent — now driven by state
        animate={animateState}
      >
        {images.map((img, index) => {
          const offset = index - 1.5;
          return (
            <motion.div
              key={index}
              // ✅ Hover events on each individual card
              onHoverStart={!isMobile ? handleCardHoverStart : undefined}
              onHoverEnd={!isMobile ? handleCardHoverEnd : undefined}
              className="absolute w-[110px] h-[150px] sm:w-[130px] sm:h-[175px] md:w-[250px] md:h-[350px] rounded-[1.5rem] overflow-hidden  group cursor-pointer"
              style={{
                zIndex: index,
                transformStyle: "preserve-3d",
                boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
              }}
              variants={{
                rest: {
                  rotate: offset * 4,
                  x: offset * (isMobile ? 18 : 35),
                  y: Math.abs(offset) * 4,
                  scale: 1 - Math.abs(offset) * 0.05,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    mass: 0.8,
                    delay: index * 0.04,
                  },
                },
                hover: {
                  rotate: offset * 6,
                  x: offset * (isMobile ? 70 : 170),
                  y: offset * offset * 5,
                  scale: 1.05,
                  boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    mass: 0.8,
                    delay: index * 0.04,
                  },
                },
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src={img.src}
                alt={`Art ${index}`}
                className="w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110"
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}