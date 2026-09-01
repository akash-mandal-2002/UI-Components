"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Sparkles, Droplets, Sliders, Waves, Zap, RefreshCw } from "lucide-react";

export type LiquidPreset = "crystal" | "ocean" | "mercury" | "prismatic" | "silk";

export interface LiquidImageProps {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  preset?: LiquidPreset;
  aspectRatio?: string;
  refraction?: number;
  damping?: number;
  tension?: number;
  dispersion?: number;
  specular?: number;
  ambientRain?: boolean;
  rainInterval?: number;
  interactive?: boolean;
  clickSplash?: boolean;
  clickStrength?: number;
  showControls?: boolean;
  showBadge?: boolean;
  badgeTitle?: string;
  badgeSubtitle?: string;
  onLoaded?: () => void;
  children?: React.ReactNode;
}

export const PRESET_CONFIGS: Record<
  LiquidPreset,
  {
    name: string;
    description: string;
    refraction: number;
    damping: number;
    tension: number;
    dispersion: number;
    specular: number;
    caustic: number;
    tint: [number, number, number];
    wobble: number;
    icon: string;
  }
> = {
  crystal: {
    name: "Crystal Clear",
    description: "Crisp aquatic caustics with pure high-gloss refraction",
    refraction: 0.038,
    damping: 0.986,
    tension: 1.6,
    dispersion: 0.015,
    specular: 0.65,
    caustic: 0.45,
    tint: [1.0, 1.0, 1.0],
    wobble: 1.0,
    icon: "Sparkles",
  },
  ocean: {
    name: "Deep Ocean",
    description: "Deep azure refractive swell with dynamic crest lighting",
    refraction: 0.052,
    damping: 0.982,
    tension: 1.8,
    dispersion: 0.025,
    specular: 0.8,
    caustic: 0.6,
    tint: [0.9, 0.96, 1.04],
    wobble: 1.4,
    icon: "Waves",
  },
  mercury: {
    name: "Liquid Chrome",
    description: "High-contrast metallic fluidity with intense specular gleam",
    refraction: 0.065,
    damping: 0.988,
    tension: 2.1,
    dispersion: 0.008,
    specular: 1.4,
    caustic: 0.8,
    tint: [1.05, 1.05, 1.08],
    wobble: 0.6,
    icon: "Zap",
  },
  prismatic: {
    name: "Prismatic Caustics",
    description: "Vibrant chromatic spectral dispersion & luxury optical refraction",
    refraction: 0.048,
    damping: 0.984,
    tension: 1.7,
    dispersion: 0.075,
    specular: 0.75,
    caustic: 0.7,
    tint: [1.0, 1.0, 1.0],
    wobble: 1.2,
    icon: "Sparkles",
  },
  silk: {
    name: "Subtle Silk",
    description: "Gentle, calm micro-ripples tailored for editorial photography",
    refraction: 0.022,
    damping: 0.978,
    tension: 1.3,
    dispersion: 0.008,
    specular: 0.4,
    caustic: 0.25,
    tint: [1.0, 1.0, 1.0],
    wobble: 0.4,
    icon: "Droplets",
  },
};

export default function LiquidImage({
  src = "/Images/Project.png",
  alt = "Liquid Fluid Image",
  className = "",
  style = {},
  preset = "crystal",
  aspectRatio,
  refraction,
  damping,
  tension,
  dispersion,
  specular,
  ambientRain = false,
  rainInterval = 2800,
  interactive = true,
  clickSplash = true,
  clickStrength = 1.8,
  showControls = false,
  showBadge = false,
  badgeTitle = "WebGL Fluid Engine",
  badgeSubtitle = "Move cursor • Click to splash",
  onLoaded,
  children,
}: LiquidImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPreset, setCurrentPreset] = useState<LiquidPreset>(preset);
  const [isLoaded, setIsLoaded] = useState(false);
  const [rainEnabled, setRainEnabled] = useState(ambientRain);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [activeRefraction, setActiveRefraction] = useState<number | null>(null);
  const [activeDispersion, setActiveDispersion] = useState<number | null>(null);
  const [activeDamping, setActiveDamping] = useState<number | null>(null);

  // Sync internal preset if prop changes
  useEffect(() => {
    setCurrentPreset(preset);
  }, [preset]);

  // Active configuration based on preset and overrides
  const config = PRESET_CONFIGS[currentPreset] || PRESET_CONFIGS.crystal;
  const effectiveRefraction = activeRefraction ?? refraction ?? config.refraction;
  const effectiveDamping = activeDamping ?? damping ?? config.damping;
  const effectiveTension = tension ?? config.tension;
  const effectiveDispersion = activeDispersion ?? dispersion ?? config.dispersion;
  const effectiveSpecular = specular ?? config.specular;
  const effectiveCaustic = config.caustic;
  const effectiveTint = config.tint;
  const effectiveWobble = config.wobble;

  // Refs for dynamic uniform updates without re-instantiating WebGL
  const uniformsRef = useRef<{
    trail?: THREE.ShaderMaterial["uniforms"];
    display?: THREE.ShaderMaterial["uniforms"];
    triggerSplash?: (x: number, y: number, strength: number) => void;
    triggerRaindrop?: (x: number, y: number, strength: number) => void;
  }>({});

  // Trigger splash imperatively or from UI
  const triggerManualSplash = useCallback((x = 0.5, y = 0.5, strength = clickStrength) => {
    if (uniformsRef.current.triggerSplash) {
      uniformsRef.current.triggerSplash(x, y, strength);
    }
  }, [clickStrength]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // -----------------------------------------
    // 1. WebGL Renderer Initialization
    // -----------------------------------------
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      precision: "highp",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    // -----------------------------------------
    // 2. Render Targets for Wave Heightfield Ping-Pong
    // -----------------------------------------
    const targetType =
      renderer.capabilities.isWebGL2 || renderer.extensions.has("OES_texture_half_float")
        ? THREE.HalfFloatType
        : THREE.FloatType;

    let rtA = new THREE.WebGLRenderTarget(1, 1, {
      type: targetType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      depthBuffer: false,
      stencilBuffer: false,
    });

    let rtB = rtA.clone();

    const trailScene = new THREE.Scene();
    const trailCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    trailCamera.position.z = 1;

    // -----------------------------------------
    // 3. Mouse & Pointer Tracking State
    // -----------------------------------------
    const mouse = new THREE.Vector2(-10, -10);
    const targetMouse = new THREE.Vector2(-10, -10);
    const prevMouse = new THREE.Vector2(-10, -10);
    const mouseVelocity = new THREE.Vector2(0, 0);

    const splashState = {
      pos: new THREE.Vector2(-10, -10),
      intensity: 0,
    };

    const rainState = {
      pos: new THREE.Vector2(-10, -10),
      intensity: 0,
    };

    let isPointerOver = 0;
    let targetPointerOver = 0;

    // -----------------------------------------
    // 4. Fluid Simulation Physics Shader
    // -----------------------------------------
    const trailMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPrevTrail: { value: null },
        uMouse: { value: mouse },
        uPrevMouse: { value: prevMouse },
        uVelocity: { value: mouseVelocity },
        uAspect: { value: 1.0 },
        uTexel: { value: new THREE.Vector2(1, 1) },
        uDamping: { value: effectiveDamping },
        uTension: { value: effectiveTension },
        uRadius: { value: 0.048 },
        uIntensity: { value: 1.0 },
        uIsHovered: { value: 0 },
        uSplashPos: { value: splashState.pos },
        uSplashIntensity: { value: 0 },
        uRainPos: { value: rainState.pos },
        uRainIntensity: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform sampler2D uPrevTrail;
        uniform vec2 uMouse;
        uniform vec2 uPrevMouse;
        uniform vec2 uVelocity;
        uniform float uAspect;
        uniform vec2 uTexel;
        uniform float uDamping;
        uniform float uTension;
        uniform float uRadius;
        uniform float uIntensity;
        uniform float uIsHovered;

        uniform vec2 uSplashPos;
        uniform float uSplashIntensity;

        uniform vec2 uRainPos;
        uniform float uRainIntensity;

        varying vec2 vUv;

        // Distance from point p to line segment between a and b
        float distToSegment(vec2 p, vec2 a, vec2 b) {
          vec2 pa = p - a;
          vec2 ba = b - a;
          float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.000001), 0.0, 1.0);
          return length(pa - ba * h);
        }

        void main() {
          vec2 uv = vUv;

          // -----------------------------------------
          // Previous Wave State: R = Height, G = Velocity
          // -----------------------------------------
          vec4 self = texture2D(uPrevTrail, uv);
          float h = self.r;
          float v = self.g;

          // -----------------------------------------
          // Neighbor Stencil Samples (Orthogonal + Diagonal)
          // -----------------------------------------
          float hL = texture2D(uPrevTrail, uv - vec2(uTexel.x, 0.0)).r;
          float hR = texture2D(uPrevTrail, uv + vec2(uTexel.x, 0.0)).r;
          float hU = texture2D(uPrevTrail, uv + vec2(0.0, uTexel.y)).r;
          float hD = texture2D(uPrevTrail, uv - vec2(0.0, uTexel.y)).r;

          float hTL = texture2D(uPrevTrail, uv + vec2(-uTexel.x, uTexel.y)).r;
          float hTR = texture2D(uPrevTrail, uv + vec2(uTexel.x, uTexel.y)).r;
          float hBL = texture2D(uPrevTrail, uv + vec2(-uTexel.x, -uTexel.y)).r;
          float hBR = texture2D(uPrevTrail, uv + vec2(uTexel.x, -uTexel.y)).r;

          // 9-point isotropic discrete Laplacian
          float laplacian = (
            (hL + hR + hU + hD) * 0.5 +
            (hTL + hTR + hBL + hBR) * 0.25 -
            h * 3.0
          ) * 0.3333;

          // Wave equation step
          v += laplacian * uTension;
          v *= uDamping;
          h += v;

          // -----------------------------------------
          // Aspect-corrected coordinate space
          // -----------------------------------------
          vec2 aspectUV = vec2(uv.x * uAspect, uv.y);
          vec2 aspectMouse = vec2(uMouse.x * uAspect, uMouse.y);
          vec2 aspectPrevMouse = vec2(uPrevMouse.x * uAspect, uPrevMouse.y);

          // -----------------------------------------
          // Continuous Mouse Line Wake Splat
          // -----------------------------------------
          if (uIsHovered > 0.001) {
            float lineDist = distToSegment(aspectUV, aspectPrevMouse, aspectMouse);
            float speed = length(uVelocity) * 80.0;
            float pokeStrength = clamp(speed, 0.25, 3.5) * uIntensity * uIsHovered;
            float poke = smoothstep(uRadius, 0.0, lineDist) * pokeStrength * 0.85;
            h += poke;
          }

          // -----------------------------------------
          // Splash Shockwave Burst
          // -----------------------------------------
          if (uSplashIntensity > 0.001) {
            vec2 aspectSplash = vec2(uSplashPos.x * uAspect, uSplashPos.y);
            float splashDist = distance(aspectUV, aspectSplash);
            float splashPoke = smoothstep(uRadius * 2.8, 0.0, splashDist) * uSplashIntensity * 1.5;
            h += splashPoke;
          }

          // -----------------------------------------
          // Ambient Raindrop Impact
          // -----------------------------------------
          if (uRainIntensity > 0.001) {
            vec2 aspectRain = vec2(uRainPos.x * uAspect, uRainPos.y);
            float rainDist = distance(aspectUV, aspectRain);
            float rainPoke = smoothstep(uRadius * 1.5, 0.0, rainDist) * uRainIntensity;
            h += rainPoke;
          }

          // Output updated state
          gl_FragColor = vec4(h, v, 0.0, 1.0);
        }
      `,
    });

    const trailPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), trailMaterial);
    trailScene.add(trailPlane);

    // -----------------------------------------
    // 5. Image Texture Loader & Aspect Preserver
    // -----------------------------------------
    let imageNaturalAspect = 1.0;

    const texture = new THREE.TextureLoader().load(
      src,
      (tex) => {
        if (tex.image) {
          imageNaturalAspect = tex.image.width / Math.max(1, tex.image.height);
          if (displayMaterial.uniforms.uImageAspect) {
            displayMaterial.uniforms.uImageAspect.value = imageNaturalAspect;
          }
        }
        setIsLoaded(true);
        if (onLoaded) onLoaded();
      },
      undefined,
      (err) => {
        console.warn("Failed to load texture:", src, err);
        setIsLoaded(true);
      }
    );

    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    // -----------------------------------------
    // 6. Display / Optical Refraction Shader
    // -----------------------------------------
    const displayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uTrail: { value: null },
        uTime: { value: 0 },
        uTexel: { value: new THREE.Vector2(1, 1) },
        uAspect: { value: 1.0 },
        uImageAspect: { value: 1.0 },
        uRefraction: { value: effectiveRefraction },
        uDispersion: { value: effectiveDispersion },
        uSpecular: { value: effectiveSpecular },
        uCaustic: { value: effectiveCaustic },
        uTint: { value: new THREE.Vector3(...effectiveTint) },
        uWobble: { value: effectiveWobble },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform sampler2D uTexture;
        uniform sampler2D uTrail;
        uniform float uTime;
        uniform vec2 uTexel;
        uniform float uAspect;
        uniform float uImageAspect;
        uniform float uRefraction;
        uniform float uDispersion;
        uniform float uSpecular;
        uniform float uCaustic;
        uniform vec3 uTint;
        uniform float uWobble;

        varying vec2 vUv;

        // Aspect-ratio cover mapping logic
        vec2 getCoverUV(vec2 uv, float containerAspect, float imgAspect) {
          vec2 scale = vec2(1.0);
          if (containerAspect > imgAspect) {
            scale = vec2(1.0, imgAspect / containerAspect);
          } else {
            scale = vec2(containerAspect / imgAspect, 1.0);
          }
          return (uv - 0.5) * scale + 0.5;
        }

        void main() {
          vec2 uv = vUv;

          // -----------------------------------------
          // Multi-sample Height Field for Smooth Surface Normals
          // -----------------------------------------
          float h = texture2D(uTrail, uv).r;
          float hL = texture2D(uTrail, uv - vec2(uTexel.x, 0.0)).r;
          float hR = texture2D(uTrail, uv + vec2(uTexel.x, 0.0)).r;
          float hD = texture2D(uTrail, uv - vec2(0.0, uTexel.y)).r;
          float hU = texture2D(uTrail, uv + vec2(0.0, uTexel.y)).r;

          float hTL = texture2D(uTrail, uv + vec2(-uTexel.x, uTexel.y)).r;
          float hTR = texture2D(uTrail, uv + vec2(uTexel.x, uTexel.y)).r;
          float hBL = texture2D(uTrail, uv + vec2(-uTexel.x, -uTexel.y)).r;
          float hBR = texture2D(uTrail, uv + vec2(uTexel.x, -uTexel.y)).r;

          // Sobel filtered surface slope
          float dX = ((hTR + 2.0 * hR + hBR) - (hTL + 2.0 * hL + hBL)) * 0.25;
          float dY = ((hTL + 2.0 * hU + hTR) - (hBL + 2.0 * hD + hBR)) * 0.25;

          // Realistic 3D water surface normal
          vec3 normal = normalize(vec3(-dX * 7.5, -dY * 7.5, 1.0));

          // -----------------------------------------
          // Caustic Curvature / Crest Detection
          // -----------------------------------------
          float laplacian = (hL + hR + hU + hD) * 0.25 - h;
          float curvature = clamp(laplacian * 16.0, 0.0, 1.0);

          // -----------------------------------------
          // Ambient Liquid Micro-Wobble
          // -----------------------------------------
          vec2 ambientWobble = vec2(
            sin(uv.y * 24.0 + uTime * 1.1) * 0.0006 + sin(uv.x * 20.0 - uTime * 0.8) * 0.0004,
            cos(uv.x * 22.0 + uTime * 0.9) * 0.0006 + cos(uv.y * 26.0 - uTime * 1.0) * 0.0004
          ) * uWobble;

          // -----------------------------------------
          // Multi-Spectral Chromatic Dispersion
          // -----------------------------------------
          vec2 baseOffset = normal.xy * uRefraction + ambientWobble;
          float dispersionOffset = uDispersion * length(normal.xy);

          vec2 uvBase = uv;
          vec2 uvR = getCoverUV(uvBase + baseOffset * (1.0 + dispersionOffset * 1.8), uAspect, uImageAspect);
          vec2 uvG = getCoverUV(uvBase + baseOffset, uAspect, uImageAspect);
          vec2 uvB = getCoverUV(uvBase + baseOffset * (1.0 - dispersionOffset * 1.8), uAspect, uImageAspect);

          // Clamped texture sampling
          float r = texture2D(uTexture, clamp(uvR, 0.001, 0.999)).r;
          float g = texture2D(uTexture, clamp(uvG, 0.001, 0.999)).g;
          float b = texture2D(uTexture, clamp(uvB, 0.001, 0.999)).b;
          vec3 color = vec3(r, g, b);

          // -----------------------------------------
          // Dual-Lobe Specular Lighting
          // -----------------------------------------
          vec3 keyLight = normalize(vec3(-0.35, 0.55, 0.75));
          vec3 fillLight = normalize(vec3(0.45, -0.25, 0.85));

          // Broad soft sheen
          float broadSheen = pow(max(dot(normal, keyLight), 0.0), 18.0) * 0.35;

          // Sharp glistening highlight
          float sharpGlint = pow(max(dot(normal, keyLight), 0.0), 80.0) * 1.1;

          // Secondary rim gleam
          float fillGlint = pow(max(dot(normal, fillLight), 0.0), 32.0) * 0.2;

          float totalSpecular = (broadSheen + sharpGlint + fillGlint) * uSpecular;

          // -----------------------------------------
          // Fresnel Edge Grazing Highlight
          // -----------------------------------------
          float fresnel = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 2.5);

          // -----------------------------------------
          // Surface Shading & Deep Water Tone
          // -----------------------------------------
          float diffuseShade = dot(normal, vec3(0.0, 0.0, 1.0));
          color *= mix(0.9, 1.0, diffuseShade);
          color *= uTint;

          // Composite highlights & caustics
          color += vec3(1.0, 1.0, 0.98) * totalSpecular;
          color += vec3(1.0, 1.0, 1.0) * curvature * uCaustic;
          color += vec3(0.92, 0.96, 1.0) * fresnel * 0.22 * uSpecular;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const displayMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), displayMaterial);
    scene.add(displayMesh);

    // Save uniform references for dynamic real-time controls
    uniformsRef.current = {
      trail: trailMaterial.uniforms,
      display: displayMaterial.uniforms,
      triggerSplash: (x, y, strength) => {
        splashState.pos.set(x, y);
        splashState.intensity = strength;
      },
      triggerRaindrop: (x, y, strength) => {
        rainState.pos.set(x, y);
        rainState.intensity = strength;
      },
    };

    // -----------------------------------------
    // 7. Resize Observer for Adaptive Viewport
    // -----------------------------------------
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      renderer.setSize(width, height);

      // Simulation resolution (half scale for high performance & silky smoothness)
      const simW = Math.max(2, Math.floor(width * 0.5));
      const simH = Math.max(2, Math.floor(height * 0.5));

      rtA.setSize(simW, simH);
      rtB.setSize(simW, simH);

      const aspect = width / height;

      trailMaterial.uniforms.uAspect.value = aspect;
      trailMaterial.uniforms.uTexel.value.set(1 / simW, 1 / simH);

      displayMaterial.uniforms.uAspect.value = aspect;
      displayMaterial.uniforms.uTexel.value.set(1 / simW, 1 / simH);
      displayMaterial.uniforms.uImageAspect.value = imageNaturalAspect;
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // -----------------------------------------
    // 8. Pointer & Touch Interactions
    // -----------------------------------------
    const updatePointerPos = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = 1.0 - (clientY - rect.top) / rect.height;
      targetMouse.set(x, y);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      targetPointerOver = 1;
      updatePointerPos(e.clientX, e.clientY);
    };

    const handlePointerEnter = (e: PointerEvent) => {
      if (!interactive) return;
      targetPointerOver = 1;
      updatePointerPos(e.clientX, e.clientY);
      mouse.copy(targetMouse);
      prevMouse.copy(targetMouse);
    };

    const handlePointerLeave = () => {
      targetPointerOver = 0;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;

      if (clickSplash) {
        splashState.pos.set(x, y);
        splashState.intensity = clickStrength;
      }
    };

    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerenter", handlePointerEnter, { passive: true });
    container.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    container.addEventListener("pointerdown", handlePointerDown, { passive: true });

    // -----------------------------------------
    // 9. Ambient Raindrop Interval
    // -----------------------------------------
    let rainTimer: NodeJS.Timeout | null = null;
    if (rainEnabled) {
      rainTimer = setInterval(() => {
        // Drop a natural pebble when pointer is inactive or randomly
        if (targetPointerOver === 0 || Math.random() < 0.4) {
          const rx = 0.15 + Math.random() * 0.7;
          const ry = 0.15 + Math.random() * 0.7;
          const rIntensity = 0.5 + Math.random() * 0.7;
          rainState.pos.set(rx, ry);
          rainState.intensity = rIntensity;
        }
      }, rainInterval);
    }

    // -----------------------------------------
    // 10. Animation Loop with Intersection Pause
    // -----------------------------------------
    const clock = new THREE.Clock();
    let animationId: number;
    let isVisible = true;

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const time = clock.getElapsedTime();

      // Smooth pointer fade & lerping
      isPointerOver += (targetPointerOver - isPointerOver) * 0.15;
      trailMaterial.uniforms.uIsHovered.value = isPointerOver;

      prevMouse.copy(mouse);
      mouse.lerp(targetMouse, 0.22);

      // Compute velocity
      const vx = mouse.x - prevMouse.x;
      const vy = mouse.y - prevMouse.y;
      mouseVelocity.lerp(new THREE.Vector2(vx, vy), 0.4);

      // Decay splash & raindrops
      if (splashState.intensity > 0.001) {
        splashState.intensity *= 0.88;
        trailMaterial.uniforms.uSplashIntensity.value = splashState.intensity;
      } else {
        trailMaterial.uniforms.uSplashIntensity.value = 0;
      }

      if (rainState.intensity > 0.001) {
        rainState.intensity *= 0.9;
        trailMaterial.uniforms.uRainIntensity.value = rainState.intensity;
      } else {
        trailMaterial.uniforms.uRainIntensity.value = 0;
      }

      // -----------------------------------------
      // Step 1: Render Simulation Pass (Ping-Pong)
      // -----------------------------------------
      trailMaterial.uniforms.uPrevTrail.value = rtA.texture;
      renderer.setRenderTarget(rtB);
      renderer.render(trailScene, trailCamera);
      renderer.setRenderTarget(null);

      // Swap buffers
      const tmp = rtA;
      rtA = rtB;
      rtB = tmp;

      // -----------------------------------------
      // Step 2: Render Main Refraction Pass
      // -----------------------------------------
      displayMaterial.uniforms.uTrail.value = rtA.texture;
      displayMaterial.uniforms.uTime.value = time;
      renderer.render(scene, camera);
    };

    animate();

    // -----------------------------------------
    // 11. Complete Cleanup & Disposal
    // -----------------------------------------
    return () => {
      cancelAnimationFrame(animationId);
      if (rainTimer) clearInterval(rainTimer);

      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerenter", handlePointerEnter);
      container.removeEventListener("pointerleave", handlePointerLeave);
      container.removeEventListener("pointerdown", handlePointerDown);

      displayMesh.geometry.dispose();
      displayMaterial.dispose();
      texture.dispose();

      trailPlane.geometry.dispose();
      trailMaterial.dispose();

      rtA.dispose();
      rtB.dispose();

      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    src,
    interactive,
    clickSplash,
    clickStrength,
    rainEnabled,
    rainInterval,
    onLoaded,
  ]);

  // Update dynamic shader parameters on preset/prop changes without recreating WebGL context
  useEffect(() => {
    if (uniformsRef.current.trail) {
      uniformsRef.current.trail.uDamping.value = effectiveDamping;
      uniformsRef.current.trail.uTension.value = effectiveTension;
    }
    if (uniformsRef.current.display) {
      uniformsRef.current.display.uRefraction.value = effectiveRefraction;
      uniformsRef.current.display.uDispersion.value = effectiveDispersion;
      uniformsRef.current.display.uSpecular.value = effectiveSpecular;
      uniformsRef.current.display.uCaustic.value = effectiveCaustic;
      uniformsRef.current.display.uTint.value.set(...effectiveTint);
      uniformsRef.current.display.uWobble.value = effectiveWobble;
    }
  }, [
    effectiveDamping,
    effectiveTension,
    effectiveRefraction,
    effectiveDispersion,
    effectiveSpecular,
    effectiveCaustic,
    effectiveTint,
    effectiveWobble,
  ]);

  return (
    <div
      className={`relative group select-none rounded-3xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-500 ${className}`}
      style={{
        aspectRatio: aspectRatio || "16/10",
        width: "100%",
        maxWidth: style.width || "800px",
        ...style,
      }}
    >
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-900/90 flex flex-col items-center justify-center gap-3 backdrop-blur-md z-20">
          <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-xs tracking-widest uppercase font-mono text-cyan-300/70">
            Initializing Liquid Shaders...
          </span>
        </div>
      )}

      {/* WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-crosshair active:cursor-grabbing"
      />

      {/* Children / Overlay Layer */}
      {children && (
        <div className="absolute inset-0 pointer-events-none z-10">{children}</div>
      )}

      {/* Luxury Status Badge */}
      {showBadge && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white/90 shadow-lg transition-transform duration-300 group-hover:scale-105">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wide text-neutral-100">
              {badgeTitle}
            </span>
            {badgeSubtitle && (
              <span className="text-[10px] text-neutral-400 font-mono">
                {badgeSubtitle}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick Action Floating Pill (Trigger Splash & Presets) */}
      {showControls && (
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-auto px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 custom-scrollbar">
            {(Object.keys(PRESET_CONFIGS) as LiquidPreset[]).map((p) => {
              const isActive = currentPreset === p;
              return (
                <button
                  key={p}
                  onClick={() => {
                    setCurrentPreset(p);
                    setActiveRefraction(null);
                    setActiveDispersion(null);
                    setActiveDamping(null);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${isActive
                      ? "bg-white/20 text-white shadow-inner border border-white/30"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
                    }`}
                >
                  <Sparkles
                    className={`w-3 h-3 ${isActive ? "text-cyan-400" : "text-neutral-500"}`}
                  />
                  {PRESET_CONFIGS[p].name}
                </button>
              );
            })}
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-2 pl-3 border-l border-white/10">
            <button
              onClick={() => triggerManualSplash(0.5, 0.5, 2.2)}
              title="Trigger Splash Burst"
              className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Droplets className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setRainEnabled((prev) => !prev)}
              title={rainEnabled ? "Disable Ambient Rain" : "Enable Ambient Rain"}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer hover:scale-105 active:scale-95 ${rainEnabled
                  ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                  : "bg-white/5 text-neutral-400 border-white/10 hover:text-white"
                }`}
            >
              <Waves className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setControlsOpen((prev) => !prev)}
              title="Fine-tune Physics Sliders"
              className={`p-1.5 rounded-lg border transition-all cursor-pointer hover:scale-105 active:scale-95 ${controlsOpen
                  ? "bg-white/20 text-white border-white/30"
                  : "bg-white/5 text-neutral-400 border-white/10 hover:text-white"
                }`}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Expanded Control Sliders Modal / Drawer */}
      {showControls && controlsOpen && (
        <div className="absolute bottom-16 right-4 z-20 w-72 p-4 rounded-2xl bg-neutral-950/90 backdrop-blur-2xl border border-white/15 shadow-2xl text-white space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Physics & Optics Tweak
            </span>
            <button
              onClick={() => {
                setActiveRefraction(null);
                setActiveDispersion(null);
                setActiveDamping(null);
              }}
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-2.5 h-2.5" /> Reset
            </button>
          </div>

          {/* Refraction Strength */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
              <span>Refraction</span>
              <span>{(effectiveRefraction * 1000).toFixed(0)}</span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.1"
              step="0.002"
              value={effectiveRefraction}
              onChange={(e) => setActiveRefraction(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
            />
          </div>

          {/* Chromatic Dispersion */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
              <span>Chromatic Dispersion</span>
              <span>{(effectiveDispersion * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.12"
              step="0.005"
              value={effectiveDispersion}
              onChange={(e) => setActiveDispersion(parseFloat(e.target.value))}
              className="w-full accent-purple-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
            />
          </div>

          {/* Damping / Fluid Viscosity */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
              <span>Wave Longevity (Damping)</span>
              <span>{(effectiveDamping * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.95"
              max="0.995"
              step="0.001"
              value={effectiveDamping}
              onChange={(e) => setActiveDamping(parseFloat(e.target.value))}
              className="w-full accent-blue-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}