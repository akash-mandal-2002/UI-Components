"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { ArrowRight , Phone , Droplets } from "lucide-react";

export function FancyButton() {
  const ref = useRef<HTMLButtonElement>(null);

  const [hoverMain, setHoverMain] = useState(false);
  const [hoverSmall, setHoverSmall] = useState(false);

  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150, mass: 0.2 };

  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const contentX = useTransform(springX, (val) => val * 0.2);
  const contentY = useTransform(springY, (val) => val * 0.2);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    setOrigin({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    setHoverMain(true);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    setOrigin({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    setHoverMain(false);

    x.set(0);
    y.set(0);
  };

  const text = "BOOK CALL";


   const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent SSR hydration mismatch with random values
  useEffect(() => setMounted(true), []);

  // Pre-calculate random droplet trajectories
  const droplets = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const radius = 50 + Math.random() * 70;
    return {
      id: i,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: 15 + Math.random() * 30,
      delay: Math.random() * 0.2,
      duration: 2 + Math.random() * 3,
    };
  });

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);
  };

  if (!mounted) return null;


  return (
    <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16 lg:gap-24 w-full p-4 md:p-8">
      {/* ================= First BUTTON ================= */}

      <motion.button
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ x: springX, y: springY }}
        className="group relative flex items-center justify-center overflow-hidden rounded-full bg-white px-8 py-4 shadow-sm"
      >
        {/* Hover Reveal Background */}

        <motion.div
          animate={{
            clipPath: hoverMain
              ? `circle(150% at ${origin.x}px ${origin.y}px)`
              : `circle(0% at ${origin.x}px ${origin.y}px)`,
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 bg-black"
        />

        {/* Content */}

        <motion.div
          style={{ x: contentX, y: contentY }}
          className="relative z-10 flex items-center gap-4 mix-blend-difference text-white"
        >
          {/* Text Animation */}

          <div className="relative flex overflow-hidden text-sm font-semibold uppercase tracking-[0.15em]">
            <div className="flex">
              {text.split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 0 }}
                  animate={{ y: hoverMain ? "-120%" : 0 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.02,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block whitespace-pre"
                >
                  {char}
                </motion.span>
              ))}
            </div>

            <div className="absolute inset-0 flex">
              {text.split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "120%" }}
                  animate={{ y: hoverMain ? 0 : "120%" }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.02,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block whitespace-pre"
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Icon */}

          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white text-black">
            <motion.div
              animate={{
                x: hoverMain ? 0 : -30,
                y: hoverMain ? 0 : 30,
              }}
              transition={{ duration: 0.5 }}
              className="absolute"
            >
              <ArrowRight className="h-4 w-4 -rotate-45" />
            </motion.div>

            <motion.div
              animate={{
                x: hoverMain ? 30 : 0,
                y: hoverMain ? -30 : 0,
              }}
              transition={{ duration: 0.5 }}
              className="absolute"
            >
              <ArrowRight className="h-4 w-4 -rotate-45" />
            </motion.div>
          </div>
        </motion.div>
      </motion.button>

      {/* ================= Second  BUTTON ================= */}

      <motion.button
        onMouseEnter={() => setHoverSmall(true)}
        onMouseLeave={() => setHoverSmall(false)}
        whileTap={{ scale: 0.95 }}
        animate={{
          width: hoverSmall ? 200 : 64,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="relative flex h-[64px] items-center justify-start overflow-hidden rounded-full bg-black p-2 shadow-2xl ring-1 ring-white/10"
      >
        {/* Icon Circle */}

        <motion.div className="relative z-10 flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-white text-black">
          <motion.div
            animate={{ rotate: hoverSmall ? -45 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          >
            <ArrowRight className="h-5 w-5" />
          </motion.div>
        </motion.div>

        {/* Text */}

        <AnimatePresence>
          {hoverSmall && (
            <motion.div
              initial={{ opacity: 0, x: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 12, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.25 }}
              className="absolute left-[56px] flex w-[124px] items-center justify-between"
            >
              <span className="text-sm font-semibold tracking-wide text-white">
                Book a call
              </span>

              <div className="h-2 w-2 rounded-full mx-2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ================= Third  BUTTON ================= */}
       <div style={{ perspective: 1000 }} className="group">
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="relative h-[64px] w-[220px] [transform-style:preserve-3d]"
        initial="rest"
        whileHover="hover"
        variants={{
          rest: { rotateX: 0 },
          hover: { rotateX: 90 }
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Front Face */}
        <div className="absolute inset-0 flex items-center justify-between rounded-2xl border border-black/10 bg-white px-6 text-black shadow-sm [backface-visibility:hidden] [transform:translateZ(32px)]">
          <span className="text-sm font-bold tracking-widest uppercase">Book Call</span>
          <motion.div 
            variants={{
              rest: { x: 0, opacity: 1 },
              hover: { x: 15, opacity: 0 }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"
          >
            <ArrowRight className="h-4 w-4" />
          </motion.div>
        </div>
        
        {/* Bottom Face */}
        <div className="absolute inset-0 flex items-center justify-between rounded-2xl bg-black px-6 text-white shadow-xl [backface-visibility:hidden] [transform:rotateX(-90deg)_translateZ(32px)]">
          <span className="text-sm font-bold tracking-widest uppercase text-white">Let's Talk</span>
          <motion.div 
            variants={{
              rest: { rotate: -45, scale: 0.5, opacity: 0 },
              hover: { rotate: [0, -15, 15, -10, 10, 0], scale: 1, opacity: 1 }
            }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
          >
            <Phone className="h-4 w-4" />
          </motion.div>
        </div>
      </motion.button>
    </div>

     {/* ================= Fourth  BUTTON ================= */}
     <div className="relative flex items-center justify-center p-4">
      {/* SVG Filter Definition for the Gooey Effect */}
      <svg className="absolute h-0 w-0">
        <defs>
          <filter id="gooey-effect">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Shockwave Effect on Click */}
      <AnimatePresence>
        {isClicked && (
          <motion.div
            initial={{ scale: 1, opacity: 1, borderWidth: "12px" }}
            animate={{ scale: 1.8, opacity: 0, borderWidth: "0px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute h-[64px] w-[240px] rounded-full border-[#ccff00]"
          />
        )}
      </AnimatePresence>

      {/* Gooey Background Layer */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ filter: "url(#gooey-effect)" }}
      >
        {/* Liquid Droplets */}
        {droplets.map((d) => (
          <motion.div
            key={d.id}
            initial={{ x: 0, y: 0, scale: 0 }}
            animate={
              isHovered
                ? {
                    x: d.x,
                    y: d.y,
                    scale: 1,
                  }
                : { x: 0, y: 0, scale: 0 }
            }
            transition={
              isHovered
                ? {
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: d.delay,
                  }
                : {
                    duration: 0.3,
                    ease: "backIn",
                  }
            }
            className="absolute rounded-full bg-[#ccff00]"
            style={{
              width: d.size,
              height: d.size,
              left: `calc(50% - ${d.size / 2}px)`,
              top: `calc(50% - ${d.size / 2}px)`,
            }}
          />
        ))}

        {/* Main Liquid Blob */}
        <motion.div
          animate={
            isHovered
              ? {
                  scale: 1.05,
                  width: 240,
                }
              : { scale: 1, width: 220 }
          }
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          className="absolute h-[64px] rounded-full bg-[#ccff00]"
        />
      </div>

      {/* Foreground Content Layer (No Filter, keeps text sharp) */}
      <motion.button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isHovered ? 1.05 : 1,
          width: isHovered ? 240 : 220,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative z-10 flex h-[64px] items-center justify-center gap-3 rounded-full bg-transparent text-[#1f2e00] outline-none"
      >
        {/* 3D Glass Highlight for the liquid */}
        <div className="pointer-events-none absolute inset-0 rounded-full border border-white/40 bg-gradient-to-b from-white/60 to-transparent mix-blend-overlay" />
        
        <Droplets className="relative z-20 h-6 w-6 fill-current drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]" />
        <span className="relative z-20 font-black tracking-[0.2em] opacity-90 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
          LIQUID SYNC
        </span>
      </motion.button>
    </div>
    </div>
  );
}













