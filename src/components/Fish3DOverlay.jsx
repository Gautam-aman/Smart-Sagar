import { useEffect, useRef } from 'react';

let threeLoadPromise;

function loadThreeJs() {
  if (window.THREE) {
    return Promise.resolve(window.THREE);
  }

  if (!threeLoadPromise) {
    threeLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
      script.async = true;
      script.onload = () => resolve(window.THREE);
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  return threeLoadPromise;
}

function createFish(THREE, color) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 18, 14),
    new THREE.MeshStandardMaterial({
      color,
      metalness: 0.1,
      roughness: 0.4,
      transparent: true,
      opacity: 0.95,
    })
  );
  body.scale.set(1.45, 0.72, 0.62);

  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.55, 3),
    new THREE.MeshStandardMaterial({
      color,
      metalness: 0.1,
      roughness: 0.45,
      transparent: true,
      opacity: 0.9,
    })
  );
  tail.rotation.z = Math.PI / 2;
  tail.position.set(-0.7, 0, 0);

  const dorsal = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.35, 3),
    new THREE.MeshStandardMaterial({
      color: 0x8ff6ff,
      metalness: 0.1,
      roughness: 0.3,
      transparent: true,
      opacity: 0.85,
    })
  );
  dorsal.rotation.x = Math.PI / 2;
  dorsal.position.set(0, 0.35, 0);

  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  eye.position.set(0.42, 0.08, 0.18);

  group.add(body);
  group.add(tail);
  group.add(dorsal);
  group.add(eye);

  return group;
}

export default function Fish3DOverlay() {
  const mountRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let frameId = null;
    let renderer = null;
    let scene = null;
    let camera = null;
    let onResize = null;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return undefined;
    }

    loadThreeJs()
      .then((THREE) => {
        if (!mounted || !mountRef.current || !THREE?.WebGLRenderer) {
          return;
        }

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 12);

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0x83e7ff, 0.6);
        const key = new THREE.DirectionalLight(0xc2f5ff, 1);
        key.position.set(3, 4, 5);
        scene.add(ambient);
        scene.add(key);

        const fishPalette = [0x00d4ff, 0x19e3b1, 0x5ea8ff, 0x96f7ff, 0x4de4c7];
        const fishes = [];
        const fishMeta = [];
        const fishCount = 11;

        for (let i = 0; i < fishCount; i += 1) {
          const fish = createFish(THREE, fishPalette[i % fishPalette.length]);
          fish.position.set(
            -10 - Math.random() * 16,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 5
          );
          fish.rotation.y = Math.PI;

          scene.add(fish);
          fishes.push(fish);
          fishMeta.push({
            speed: 0.017 + Math.random() * 0.02,
            wave: 0.55 + Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2,
            tailPhase: Math.random() * Math.PI * 2,
          });
        }

        onResize = () => {
          if (!renderer || !camera) return;
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', onResize);

        const clock = new THREE.Clock();

        const animate = () => {
          frameId = requestAnimationFrame(animate);
          const t = clock.getElapsedTime();

          fishes.forEach((fish, idx) => {
            const meta = fishMeta[idx];
            fish.position.x += meta.speed;
            fish.position.y += Math.sin(t * 0.9 + meta.phase) * 0.004 * meta.wave;
            fish.position.z += Math.cos(t * 0.6 + meta.phase) * 0.003;

            const sway = Math.sin(t * 6 + meta.tailPhase) * 0.18;
            fish.rotation.y = Math.PI + sway;
            fish.rotation.z = Math.sin(t * 1.1 + meta.phase) * 0.06;

            if (fish.position.x > 12) {
              fish.position.x = -12 - Math.random() * 8;
              fish.position.y = (Math.random() - 0.5) * 6;
              fish.position.z = (Math.random() - 0.5) * 5;
            }
          });

          renderer.render(scene, camera);
        };

        animate();
      })
      .catch(() => {
        // Decorative layer only; fail silently.
      });

    return () => {
      mounted = false;
      if (frameId) cancelAnimationFrame(frameId);
      if (onResize) window.removeEventListener('resize', onResize);
      if (renderer) {
        renderer.dispose();
        if (mountRef.current?.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      if (scene) {
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose?.();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose?.());
            } else {
              obj.material.dispose?.();
            }
          }
        });
      }
    };
  }, []);

  return <div ref={mountRef} className="fish-overlay" aria-hidden="true" />;
}
