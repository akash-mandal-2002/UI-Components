"use client"


import React, { useEffect, useState } from "react";
import { motion } from 'motion/react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      const clickable = target.closest(
        'a, button, input, select, textarea, [role="button"]',
      );
      setIsHovering(!!clickable);
    };

    window.addEventListener("mousemove", updatePosition);
    return () => window.removeEventListener("mousemove", updatePosition);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        willChange: "transform",
      }}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={18}
        height={18}
        viewBox="0 0 32 32"
        style={{
          marginLeft: "-2px",
          marginTop: "-2px",
          filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.25))",
        }}
        animate={{
          scale: isHovering ? 1.2 : 1,
          rotate: isHovering ? -10 : 0,
        }}
        transition={{
          scale: { type: "spring", stiffness: 300, damping: 20 },
          rotate: { type: "spring", stiffness: 300, damping: 20 },
        }}
      >
        {/* Dark border stroke (rendered behind fill) */}
        <path
          d="M9.391 2.32C8.42 1.56 7 2.253 7 3.486V28.41c0 1.538 1.966 2.18 2.874.938l6.225-8.523a2 2 0 0 1 1.615-.82h9.69c1.512 0 2.17-1.912.978-2.844z"
          fill="none"
          stroke="#111111"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {/* White fill on top */}
        <path
          d="M9.391 2.32C8.42 1.56 7 2.253 7 3.486V28.41c0 1.538 1.966 2.18 2.874.938l6.225-8.523a2 2 0 0 1 1.615-.82h9.69c1.512 0 2.17-1.912.978-2.844z"
          fill="#ffffff"
        />
      </motion.svg>
    </div>
  );
};

export default CustomCursor;

