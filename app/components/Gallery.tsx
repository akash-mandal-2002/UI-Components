"use client"
import React, { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'motion/react'

import Image1 from '../public/comp/1.png'
import Image2 from '../public/comp/2.png'
import Image3 from '../public/comp/3.png'
import Image4 from '../public/comp/4.png'
import Image5 from '../public/comp/5.png'
import Image6 from '../public/comp/6.png'
import Image7 from '../public/comp/7.png'
import Image8 from '../public/comp/8.png'

const images = [Image1, Image2, Image3, Image4, Image5, Image6, Image7, Image8]

const SmallImage = ({ img, i, smoothProgress, totalLength }: { img: any, i: number, smoothProgress: any, totalLength: number }) => {
  const p = useTransform(smoothProgress, [0, 1], [0, totalLength - 1]);
  const x = useTransform(p, (currentP: any) => {
    const visualGap = 20; // Consistent gap between all surrounding images
    const imageWidth = 200;
    const dottedWidth = 400; // Taking into account the large central container
    
    const strideSmall = imageWidth + visualGap;
    const extraWidth = dottedWidth - imageWidth;
    
    const dist = i - currentP;
    
    // Base rigid translation 
    const baseTranslate = dist * strideSmall;
    
    // Dynamic shift to create space for the central dotted box so that
    // the distance from the dotted box perfectly equals visualGap at all times
    let shift = 0;
    if (dist >= 1) {
      shift = extraWidth / 2;
    } else if (dist <= -1) {
      shift = -extraWidth / 2;
    } else {
      shift = (extraWidth / 2) * dist;
    }
    
    return baseTranslate + shift;
  });

  return (
    <motion.div
      style={{ x }}
      className="absolute top-0 left-0 w-[200px] h-[250px] opacity-60 shrink-0"
    >
      <Image src={img} alt={`Background Image ${i + 1}`} className="w-full h-full object-cover" />
    </motion.div>
  );
};

const Gallery = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Increased damping prevents spring overshoot so the slider doesn't run too far forward
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.1,
    bounce: 0
  });

  // Track 1 (Large foreground images)
  const strideLarge = 400; // width of large images (400px), gap is 0
  const maxTranslateLarge = (images.length - 1) * strideLarge;
  const xLarge = useTransform(smoothProgress, [0, 1], [0, -maxTranslateLarge]);

  // Track 2 (Small background images)
  // Logic is now handled by the dynamic SmallImage component 
  // to allow dynamic squishing and stretching.

  return (
    <div ref={containerRef} className="h-[400vh] bg-gradient-to-b from-[#0a0a0a] via-[#12100e] to-[#0a0a0a] relative">
      
      {/* Background ambient glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-[#c19b6e] rounded-full blur-[120px] opacity-[0.07] pointer-events-none z-0" />
      
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center z-10">

        {/* Ambient background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden opacity-[0.02]">
          <h1 className="text-[20vw] font-['Youth-Black'] uppercase tracking-tighter text-white whitespace-nowrap rotate-[-2deg] select-none">
            Exhibition
          </h1>
        </div>

        {/* Track 2: Small images (Background)
            These are positioned behind the main box. The first small image is centered 
            perfectly behind the dotted box, meaning it will be completely eclipsed by the large image.
            The rest of the small images queue up sequentially to the right. */}
        <div className="absolute left-1/2 top-[50%] mt-[calc(-250px/2)] ml-[calc(-200px/2)] w-[200px] h-[250px] z-10">
          {images.map((img, i) => (
            <SmallImage
              key={i}
              img={img}
              i={i}
              smoothProgress={smoothProgress}
              totalLength={images.length}
            />
          ))}
        </div>

        {/* The Central Dotted Box fixed relative to window (Exactly centered) 
            It acts as a literal mask using overflow-hidden so the large images 
            ONLY render exactly inside its bounds. */}
        <div className="relative w-[400px] h-[600px] border border-dashed border-gray-300 bg-neutral-900/20 backdrop-blur-sm z-20 overflow-hidden box-border shadow-2xl">

          {/* Track 1: Large images (Foreground)
              These translate sequentially inside the restricted viewport of the dotted box. */}
          <motion.div
            style={{ x: xLarge }}
            className="flex items-center gap-0 w-max h-full"
          >
            {images.map((img, i) => (
              <div key={i} className="w-[400px] h-[600px] shrink-0 p-0.5 md:p-1.5">
                <Image
                  src={img}
                  alt={`Foreground Image ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </motion.div>

        </div>

        {/* Brand Text (Top Left) */}
        <div className="absolute left-6 md:left-12 top-6 md:top-10 z-30 pointer-events-none flex flex-col">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex items-center gap-4 ml-1 mb-2 md:mb-4"
          >
            <div className="w-8 md:w-12 h-[2px] bg-[#c19b6e]"></div>
            <span className="text-[10px] md:text-xs font-['Youth-Medium'] tracking-[0.5em] text-[#c19b6e] uppercase">
              Curated Works
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col text-white drop-shadow-2xl"
          >
            <span className="text-6xl md:text-8xl lg:text-[7rem] font-['Youth-Bold'] uppercase tracking-tight leading-[0.85] bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
              Gallery
            </span>
            <span className="text-2xl md:text-4xl lg:text-5xl font-['Youth-Regular'] text-[#c19b6e] mt-1 md:mt-2 tracking-[0.15em] uppercase pl-1">
              2026
            </span>
          </motion.h1>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 md:bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-2 md:gap-3 pointer-events-none">
          <div className="relative flex items-center justify-center w-6 h-6 md:w-8 md:h-8 shrink-0">
            {/* Rotating Dotted Circle */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute inset-0 rounded-full border-[1.5px] border-dashed border-white/60"
            />
            {/* Downward Animating Arrow */}
            <motion.div
              animate={{ y: [-8, 8], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
              className="text-white"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-3 md:h-3">
                <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </div>
          <span className="text-[10px] md:text-xs font-['Youth-Medium'] font-bold tracking-[0.05em] text-white/90 uppercase mt-0.5">
            Scroll to continue
          </span>
        </div>
      </div>
    </div>
  )
}

export default Gallery