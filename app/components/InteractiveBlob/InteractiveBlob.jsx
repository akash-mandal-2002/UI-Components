import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function InteractiveBlob() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth /
        container.clientHeight,
      0.1,
      100
    );

    camera.position.z = 3;

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    container.appendChild(
      renderer.domElement
    );

    // -------------------------
    // Mouse
    // -------------------------

    const mouse = new THREE.Vector2();
    const targetMouse =
      new THREE.Vector2();

    // -------------------------
    // Geometry
    // -------------------------

    const geometry =
      new THREE.SphereGeometry(
        1,
        128,
        128
      );

    // -------------------------
    // Shader
    // -------------------------

    const material =
      new THREE.ShaderMaterial({

        uniforms: {

          uTime: {
            value: 0,
          },

          uMouse: {
            value: mouse,
          },

        },

        vertexShader: `

          uniform float uTime;
          uniform vec2 uMouse;

          varying vec3 vNormal;
          varying vec3 vPosition;

          void main() {

            vec3 pos = position;

            // Animated organic movement
            float wave1 =
              sin(pos.x * 4.0 + uTime);

            float wave2 =
              sin(pos.y * 5.0 + uTime * 1.3);

            float wave3 =
              sin(pos.z * 6.0 + uTime * 0.8);

            float noise =
              (wave1 +
               wave2 +
               wave3) / 3.0;

            pos += normal *
                    noise *
                    0.08;

            // Mouse influence
            vec3 mousePoint =
              vec3(
                uMouse.x,
                uMouse.y,
                0.0
              );

            float mouseDistance =
              distance(
                pos.xy,
                mousePoint.xy
              );

            float mouseStrength =
              smoothstep(
                0.8,
                0.0,
                mouseDistance
              );

            pos += normal *
                    mouseStrength *
                    0.25;

            vNormal =
              normalize(
                normalMatrix * normal
              );

            vPosition = pos;

            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(pos, 1.0);
          }
        `,

        fragmentShader: `

          uniform float uTime;

          varying vec3 vNormal;
          varying vec3 vPosition;

          void main() {

            // Fake light
            vec3 light =
              normalize(
                vec3(
                  -0.5,
                  0.8,
                  1.0
                )
              );

            float lighting =
              dot(
                vNormal,
                light
              );

            lighting =
              lighting * 0.5 + 0.5;

            // Dynamic color
            vec3 colorA =
              vec3(
                1.0,
                0.05,
                0.25
              );

            vec3 colorB =
              vec3(
                1.0,
                0.55,
                0.05
              );

            vec3 finalColor =
              mix(
                colorA,
                colorB,
                lighting
              );

            gl_FragColor =
              vec4(
                finalColor,
                1.0
              );
          }
        `,
      });

    const blob =
      new THREE.Mesh(
        geometry,
        material
      );

    scene.add(blob);

    // -------------------------
    // Mouse movement
    // -------------------------

    const handleMouseMove =
      (event) => {

        const rect =
          container.getBoundingClientRect();

        targetMouse.x =
          ((event.clientX -
            rect.left) /
            rect.width) *
            2 -
          1;

        targetMouse.y =
          -(
            ((event.clientY -
              rect.top) /
              rect.height) *
              2 -
            1
          );
      };

    container.addEventListener(
      "pointermove",
      handleMouseMove
    );

    // -------------------------
    // Animation
    // -------------------------

    const clock =
      new THREE.Clock();

    let animationId;

    const animate = () => {

      animationId =
        requestAnimationFrame(
          animate
        );

      material.uniforms.uTime.value =
        clock.getElapsedTime();

      mouse.lerp(
        targetMouse,
        0.06
      );

      // Slow rotation
      blob.rotation.y +=
        0.002;

      blob.rotation.x +=
        0.001;

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    // -------------------------
    // Resize
    // -------------------------

    const resize = () => {

      const width =
        container.clientWidth;

      const height =
        container.clientHeight;

      camera.aspect =
        width / height;

      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height
      );
    };

    window.addEventListener(
      "resize",
      resize
    );

    return () => {

      cancelAnimationFrame(
        animationId
      );

      window.removeEventListener(
        "resize",
        resize
      );

      container.removeEventListener(
        "pointermove",
        handleMouseMove
      );

      geometry.dispose();

      material.dispose();

      renderer.dispose();

      container.removeChild(
        renderer.domElement
      );
    };

  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "600px",
        height: "600px",
      }}
    />
  );
}