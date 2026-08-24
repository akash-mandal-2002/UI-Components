"use client"

import React, { useState } from "react"

const style = `
  @keyframes lidOpen {
    0%   { transform: rotate(0deg); }
    20%  { transform: rotate(-55deg); }
    75%  { transform: rotate(-55deg); }
    90%  { transform: rotate(0deg); }
    95%  { transform: rotate(-4deg); }
    100% { transform: rotate(0deg); }
  }
  @keyframes particle1 {
    0%   { opacity: 0; transform: translate(0px, -28px) rotate(0deg) scale(1); }
    15%  { opacity: 1; transform: translate(2px, -26px) rotate(10deg) scale(1); }
    55%  { opacity: 1; transform: translate(1px, 2px) rotate(-5deg) scale(0.8); }
    70%  { opacity: 0; transform: translate(0px, 8px) scale(0.4); }
    100% { opacity: 0; }
  }
  @keyframes particle2 {
    0%   { opacity: 0; transform: translate(0px, -22px) rotate(0deg) scale(1); }
    20%  { opacity: 1; transform: translate(-2px, -22px) rotate(-15deg) scale(1); }
    60%  { opacity: 1; transform: translate(-1px, 4px) rotate(8deg) scale(0.7); }
    75%  { opacity: 0; transform: translate(0px, 10px) scale(0.3); }
    100% { opacity: 0; }
  }
  @keyframes particle3 {
    0%   { opacity: 0; transform: translate(0px, -18px) scale(1); }
    25%  { opacity: 1; transform: translate(3px, -18px) rotate(20deg) scale(1); }
    65%  { opacity: 1; transform: translate(1px, 6px) rotate(-10deg) scale(0.6); }
    80%  { opacity: 0; transform: translate(1px, 12px) scale(0.2); }
    100% { opacity: 0; }
  }

  .trash-lid {
    transform-origin: 3px 4px;
  }
  .trash-lid.animating {
    animation: lidOpen 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  .trash-particle {
    opacity: 0;
  }
  .trash-particle.p1.animating { animation: particle1 1.5s ease forwards; }
  .trash-particle.p2.animating { animation: particle2 1.5s ease 0.05s forwards; }
  .trash-particle.p3.animating { animation: particle3 1.5s ease 0.1s forwards; }

`

function AnimatedTrashIcon({ animating }: { animating: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ overflow: "visible" }}
    >
      <defs>
        <clipPath id="bin-clip">
          <rect x="-10" y="-40" width="44" height="46" />
        </clipPath>
      </defs>
      {/* Garbage particles — fall from above into the bin */}
      <g clipPath="url(#bin-clip)">
        <g transform="translate(12, 8)">
          <g className={`trash-particle p1 ${animating ? "animating" : ""}`}>
            <rect x="-3" y="-3" width="6" height="4" rx="1" fill="rgba(255,255,255,0.85)" stroke="none" />
          </g>
          <g className={`trash-particle p2 ${animating ? "animating" : ""}`}>
            <circle cx="0" cy="0" r="2.5" fill="rgba(255,255,255,0.7)" stroke="none" />
          </g>
          <g className={`trash-particle p3 ${animating ? "animating" : ""}`}>
            <rect x="-2" y="-2" width="4" height="3" rx="1" fill="rgba(255,255,255,0.6)" stroke="none" />
          </g>
        </g>
      </g>

      {/* Trash body — static */}
      {/* Bin body */}
      <path d="M3 6h18" />
      <path d="M19 6l-1 14H6L5 6" />
      {/* Vertical lines inside bin */}
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />

      {/* Lid group — animates open */}
      <g className={`trash-lid ${animating ? "animating" : ""}`}>
        {/* Lid bar */}
        <path d="M3 6h18" stroke="currentColor" />
        {/* Handle */}
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </g>
    </svg>
  )
}

const Page = () => {
  const [phase, setPhase] = useState<"idle" | "shrinking" | "animating" | "expanding">("idle")

  const handleClick = () => {
    if (phase !== "idle") return
    
    // 1. Shrink button to circle
    setPhase("shrinking")
    
    // 2. Play trash animation
    setTimeout(() => {
      setPhase("animating")
      
      // 3. Expand button back
      setTimeout(() => {
        setPhase("expanding")
        
        // 4. Return to idle
        setTimeout(() => {
          setPhase("idle")
        }, 500)
      }, 1500)
    }, 300)
  }

  const isShrunk = phase === "shrinking" || phase === "animating"

  return (
    <>
      <style>{style}</style>
      <div className="w-full bg-white h-screen flex items-center justify-center gap-32">
        {/* Normal Button */}
        <div className="flex flex-col items-center gap-4">
          <span className="text-gray-600 text-md font-semibold tracking-wide">Option A</span>
          <button className="flex items-center justify-center h-10 px-5 bg-red-500/90 text-white rounded-full hover:bg-red-500/80 active:scale-95 transition-all duration-300 ease-in-out shadow-sm shadow-red-500/20 hover:shadow-md hover:shadow-gray-300/30">
            <span className="font-medium">Delete</span>
          </button>
        </div>

        {/* Improved Button */}
        <div className="flex flex-col items-center gap-4">
          <span className="text-gray-600 text-md font-semibold tracking-wide ">Option B</span>
          <button
            onClick={handleClick}
            className={`relative flex items-center justify-center h-10 bg-red-500/90 text-white rounded-full hover:bg-red-500/80 transition-all duration-300 ease-out overflow-hidden shadow-sm shadow-red-500/20 hover:shadow-md hover:shadow-gray-300/30 ${
              isShrunk ? "w-10 px-0" : "w-[100px] px-3"
            }`}
          >
            <div className="flex items-center justify-center w-full">
              <span className="flex items-center justify-center flex-shrink-0">
                <AnimatedTrashIcon animating={phase === "animating"} />
              </span>
              <span
                className={`font-medium transition-all duration-500 ease-out whitespace-nowrap overflow-hidden flex items-center ${
                  isShrunk 
                    ? "opacity-0 w-0 translate-x-4 ml-0" 
                    : "opacity-100 w-[48px] translate-x-0 ml-2"
                }`}
              >
                Delete
              </span>
            </div>
          </button>
        </div>
      </div>
    </>
  )
}

export default Page