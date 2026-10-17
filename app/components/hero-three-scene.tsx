"use client";

import { useEffect, useRef } from "react";

export default function HeroThreeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    let disposed = false;
    let frameId = 0;
    let renderer: import("three").WebGLRenderer | undefined;
    let observer: IntersectionObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let reducedMotionQuery: MediaQueryList | undefined;
    let scene: import("three").Scene | undefined;
    let camera: import("three").PerspectiveCamera | undefined;
    let constellation: import("three").Group | undefined;
    const geometries: import("three").BufferGeometry[] = [];
    const materials: import("three").Material[] = [];
    let isVisible = true;
    let prefersReducedMotion = false;
    let pointerX = 0;
    let pointerY = 0;

    const stopAnimation = () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const renderFrame = (time: number) => {
      if (
        disposed ||
        !renderer ||
        !scene ||
        !camera ||
        !constellation ||
        !isVisible ||
        document.hidden
      ) {
        frameId = 0;
        return;
      }

      const seconds = time * 0.001;
      if (!prefersReducedMotion) {
        constellation.rotation.y = seconds * 0.12 + pointerX * 0.08;
        constellation.rotation.x = pointerY * 0.06;
        constellation.position.y = Math.sin(seconds * 0.7) * 0.045;
        constellation.children.forEach((child) => {
          if (child.userData.orbit) {
            const orbit = child.userData.orbit as {
              radius: number;
              speed: number;
              phase: number;
            };
            const angle = seconds * orbit.speed + orbit.phase;
            child.position.x = Math.cos(angle) * orbit.radius;
            child.position.y = Math.sin(angle) * orbit.radius * 0.62;
            child.position.z = Math.sin(angle * 0.8) * 0.28;
          } else if (child.userData.float) {
            const float = child.userData.float as {
              phase: number;
              amplitude: number;
              baseY: number;
              speed: number;
              spin: number;
            };
            child.position.y =
              float.baseY + Math.sin(seconds * float.speed + float.phase) * float.amplitude;
            child.rotation.x += 0.0015 * float.spin;
            child.rotation.y += 0.002 * float.spin;
          }
        });
      }

      renderer.render(scene, camera);
      if (!prefersReducedMotion) {
        frameId = window.requestAnimationFrame(renderFrame);
      } else {
        frameId = 0;
      }
    };

    const startAnimation = () => {
      stopAnimation();
      if (isVisible && !document.hidden && !disposed) {
        frameId = window.requestAnimationFrame(renderFrame);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };

    const handlePointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    };

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches;
      startAnimation();
    };

    const initialize = async () => {
      const THREE = await import("three");
      if (disposed) return;

      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
        });
      } catch (error) {
        console.error("Unable to initialize the Three.js hero scene:", error);
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0, 7.2);

      constellation = new THREE.Group();
      scene.add(constellation);

      scene.add(new THREE.AmbientLight(0xffffff, 1.8));
      const violetLight = new THREE.PointLight(0x9a6cff, 28, 12);
      violetLight.position.set(-2.5, 2.2, 3.5);
      scene.add(violetLight);
      const blueLight = new THREE.PointLight(0x90b8ff, 18, 10);
      blueLight.position.set(2.5, -1.5, 2);
      scene.add(blueLight);

      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xc9b6ff,
        transparent: true,
        opacity: 0.48,
      });
      const accentOrbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x8eb4ff,
        transparent: true,
        opacity: 0.32,
      });
      materials.push(orbitMaterial, accentOrbitMaterial);
      const orbitGeometry = new THREE.TorusGeometry(1.72, 0.012, 8, 120);
      const orbit = new THREE.Mesh(
        orbitGeometry,
        orbitMaterial,
      );
      geometries.push(orbitGeometry);
      orbit.rotation.set(0.82, 0.25, -0.32);
      constellation.add(orbit);

      const secondOrbitGeometry = new THREE.TorusGeometry(
        1.42,
        0.008,
        8,
        120,
      );
      const secondOrbit = new THREE.Mesh(
        secondOrbitGeometry,
        accentOrbitMaterial,
      );
      geometries.push(secondOrbitGeometry);
      secondOrbit.rotation.set(-0.55, 0.75, 0.4);
      constellation.add(secondOrbit);

      const coreGeometry = new THREE.SphereGeometry(0.88, 48, 36);
      const coreMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x7861a7,
        metalness: 0.28,
        roughness: 0.19,
        transparent: true,
        opacity: 0.25,
        transmission: 0.35,
        thickness: 0.8,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      });
      const core = new THREE.Mesh(
        coreGeometry,
        coreMaterial,
      );
      geometries.push(coreGeometry);
      materials.push(coreMaterial);
      constellation.add(core);

      const floatingObjects = [
        {
          geometry: new THREE.IcosahedronGeometry(0.2, 0),
          color: 0xc9b6ff,
          x: -1.95,
          y: 0.95,
          z: 0.05,
          phase: 0.7,
          amplitude: 0.15,
          speed: 0.9,
          spin: 1,
        },
        {
          geometry: new THREE.OctahedronGeometry(0.16, 0),
          color: 0x9bbcff,
          x: 1.85,
          y: -0.8,
          z: 0.35,
          phase: 2.1,
          amplitude: 0.12,
          speed: 1.1,
          spin: -1,
        },
        {
          geometry: new THREE.BoxGeometry(0.19, 0.19, 0.19),
          color: 0xf2b5a7,
          x: 1.5,
          y: 1.15,
          z: -0.25,
          phase: 1.4,
          amplitude: 0.1,
          speed: 0.8,
          spin: 0.7,
        },
      ];

      for (const object of floatingObjects) {
        const material = new THREE.MeshStandardMaterial({
          color: object.color,
          metalness: 0.38,
          roughness: 0.28,
          emissive: object.color,
          emissiveIntensity: 0.12,
        });
        geometries.push(object.geometry);
        materials.push(material);
        const mesh = new THREE.Mesh(
          object.geometry,
          material,
        );
        mesh.position.set(object.x, object.y, object.z);
        mesh.userData.float = {
          phase: object.phase,
          amplitude: object.amplitude,
          baseY: object.y,
          speed: object.speed,
          spin: object.spin,
        };
        constellation.add(mesh);
      }

      const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
      });
      materials.push(particleMaterial);
      for (let index = 0; index < 4; index += 1) {
        const particleGeometry = new THREE.SphereGeometry(
          index % 2 === 0 ? 0.045 : 0.03,
          12,
          10,
        );
        const individualMaterial = particleMaterial.clone();
        geometries.push(particleGeometry);
        materials.push(individualMaterial);
        const particle = new THREE.Mesh(
          particleGeometry,
          individualMaterial,
        );
        particle.userData.orbit = {
          radius: 1.9 + (index % 2) * 0.2,
          speed: index % 2 === 0 ? 0.35 : -0.28,
          phase: (index / 4) * Math.PI * 2,
        };
        constellation.add(particle);
      }

      const resize = () => {
        if (!renderer || !camera || !scene) return;
        const { width, height } = container.getBoundingClientRect();
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.position.z = width < 420 ? 7.8 : 7.2;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        renderer.render(scene, camera);
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();

      observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) startAnimation();
        else stopAnimation();
      });
      observer.observe(container);

      reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      prefersReducedMotion = reducedMotionQuery.matches;
      reducedMotionQuery.addEventListener("change", handleMotionPreference);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      container.addEventListener("pointermove", handlePointerMove);
      container.addEventListener("pointerleave", handlePointerLeave);
      startAnimation();
    };

    void initialize();

    return () => {
      disposed = true;
      stopAnimation();
      observer?.disconnect();
      resizeObserver?.disconnect();
      reducedMotionQuery?.removeEventListener("change", handleMotionPreference);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
}
