import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import * as THREE from 'three';

export default function GlobeAnimation() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const threeRef = useRef({});
  
  // Scroll tracking
  const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start start", "end end"]
  });
  
  // Smooth spring for scroll
  const smoothProgress = useSpring(scrollYProgress, {
      stiffness: 50,
      damping: 20,
      restDelta: 0.001
  });

  // Transforms
  const introBlur = useTransform(smoothProgress, [0, 0.15], [6.42, 0]);
  const endBlur = useTransform(smoothProgress, [0.75, 1], [0, 4.5]);
  const textOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0]);
  const textBlurVal = useTransform(smoothProgress, [0, 0.12], [0, 15]);
  const indicatorOpacity = useTransform(smoothProgress, [0, 0.08], [0.6, 0]);
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // Config
  const config = {
      speed: 0.08,
      density: 600,
      cityWidth: 200,
      roadWidth: 6,
      heightVar: 25,
      widthVar: 4,
      baseHeight: 1,
      baseWidth: 0.8,
      depthVar: 2,
      bldgOpacity: 0.9,
      gridOpacity: 0.4,
      fov: 75,
      camHeight: 20,
      globeRadius: 40,
      globeSegments: 24,
      globeRotationSpeed: 0.003
  };

  // Three.js setup
  useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0xffffff);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);

      const camera = new THREE.PerspectiveCamera(
          config.fov,
          window.innerWidth / window.innerHeight,
          0.1,
          500
      );

      // Globe
      const globeGeo = new THREE.IcosahedronGeometry(config.globeRadius, 3);
      const globeEdges = new THREE.EdgesGeometry(globeGeo);
      const globeMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.7 });
      const globe = new THREE.LineSegments(globeEdges, globeMat);
      scene.add(globe);

      // Sphere wireframe
      const sphereGeo = new THREE.SphereGeometry(config.globeRadius, config.globeSegments, config.globeSegments);
      const sphereWire = new THREE.WireframeGeometry(sphereGeo);
      const sphereMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
      const sphereLines = new THREE.LineSegments(sphereWire, sphereMat);
      scene.add(sphereLines);

      // Grid
      const grid = new THREE.GridHelper(600, 150, 0x000000, 0x000000);
      grid.position.y = -0.5;
      grid.material.transparent = true;
      grid.material.opacity = 0;
      scene.add(grid);

      // Buildings
      const boxGeo = new THREE.BoxGeometry(1, 1, 1);
      const edgesGeo = new THREE.EdgesGeometry(boxGeo);
      const buildings = [];

      const sphericalToCart = (r, phi, theta) => new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
      );

      for (let i = 0; i < config.density; i++) {
          const mat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: config.bldgOpacity });
          const mesh = new THREE.LineSegments(edgesGeo, mat);

          const w = config.baseWidth + Math.random() * config.widthVar;
          const h = config.baseHeight + Math.random() * config.heightVar;
          const d = 1 + Math.random() * config.depthVar;
          mesh.scale.set(w, h, d);

          const phi = Math.acos(1 - 2 * Math.random());
          const theta = Math.random() * Math.PI * 2;
          const spherePos = sphericalToCart(config.globeRadius + h / 2, phi, theta);
          const sphereNormal = spherePos.clone().normalize();

          let flatX = (Math.random() - 0.5) * config.cityWidth;
          const flatZ = 10 - Math.random() * 210;
          const halfRoad = config.roadWidth / 2;
          if (Math.abs(flatX) < halfRoad + w / 2) {
              flatX = Math.sign(flatX || 1) * (halfRoad + w / 2 + Math.random() * 2);
          }

          buildings.push({
              mesh,
              spherePos,
              sphereNormal,
              flatPos: new THREE.Vector3(flatX, h / 2 - 0.5, flatZ),
              baseZ: flatZ,
              h
          });

          scene.add(mesh);
      }

      // Camera positions
      const camGlobe = new THREE.Vector3(0, 30, 120);
      const camCity = new THREE.Vector3(0, config.camHeight, 5);
      const lookGlobe = new THREE.Vector3(0, 0, 0);
      const lookCity = new THREE.Vector3(0, 5, -50);

      camera.position.copy(camGlobe);
      camera.lookAt(lookGlobe);

      // Store refs
      threeRef.current = { scene, camera, renderer, globe, sphereLines, grid, buildings, camGlobe, camCity, lookGlobe, lookCity };

      let globeRot = 0;
      let animId;

      const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

      const animate = () => {
          animId = requestAnimationFrame(animate);
          
          const progress = smoothProgress.get();
          
          const phase1End = 0.35;
          const phase2End = 0.75;

          let unravel = 0;
          if (progress <= phase1End) {
              unravel = 0;
          } else if (progress <= phase2End) {
              unravel = easeInOutCubic((progress - phase1End) / (phase2End - phase1End));
          } else {
              unravel = 1;
          }

          // Globe rotation
          const rotMult = 1 - easeOutExpo(Math.min(1, progress / phase2End));
          globeRot += config.globeRotationSpeed * rotMult;
          globe.rotation.y = globeRot;
          sphereLines.rotation.y = globeRot;

          // Globe fade
          const gScale = Math.max(0.01, 1 - unravel);
          const gFade = Math.max(0, 1 - unravel / 0.6);
          globe.scale.setScalar(gScale);
          sphereLines.scale.setScalar(gScale);
          globe.material.opacity = 0.7 * gFade;
          sphereLines.material.opacity = 0.25 * gFade;

          // Grid
          grid.material.opacity = config.gridOpacity * unravel;

          // Buildings
          buildings.forEach(b => {
              const sPos = b.spherePos.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), globeRot);
              const fPos = new THREE.Vector3(b.flatPos.x, b.flatPos.y, b.baseZ);
              b.mesh.position.lerpVectors(sPos, fPos, unravel);

              if (unravel < 1) {
                  const sNorm = b.sphereNormal.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), globeRot);
                  const sQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), sNorm);
                  b.mesh.quaternion.slerpQuaternions(sQuat, new THREE.Quaternion(), unravel);
              } else {
                  b.mesh.quaternion.identity();
              }

              // Opacity
              b.mesh.material.opacity = unravel < 0.6 
                  ? config.bldgOpacity * (1 - unravel / 0.6)
                  : config.bldgOpacity * ((unravel - 0.6) / 0.4);
          });

          // Camera
          if (progress <= phase1End) {
              const z = progress / phase1End;
              camera.position.copy(camGlobe).setZ(camGlobe.z - z * 40);
              camera.lookAt(lookGlobe);
          } else if (progress <= phase2End) {
              const t = easeInOutCubic((progress - phase1End) / (phase2End - phase1End));
              const startPos = camGlobe.clone().setZ(camGlobe.z - 40);
              camera.position.lerpVectors(startPos, camCity, t);
              const lookAt = new THREE.Vector3().lerpVectors(lookGlobe, lookCity, t);
              camera.lookAt(lookAt);
          } else {
              camera.position.copy(camCity);
              camera.lookAt(lookCity);
          }

          // City scroll
          if (unravel >= 1) {
              buildings.forEach(b => {
                  b.baseZ += config.speed;
                  b.mesh.position.z = b.baseZ;
                  if (b.baseZ > 20) b.baseZ -= 230;
              });
              grid.position.z = (grid.position.z + config.speed) % 4;
          }

          // Fog
          if (unravel > 0.5) {
              scene.fog = new THREE.FogExp2(0xffffff, 0.015 * (unravel - 0.5) * 2);
          } else {
              scene.fog = null;
          }

          renderer.render(scene, camera);
      };

      animate();

      const onResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);

      return () => {
          cancelAnimationFrame(animId);
          window.removeEventListener('resize', onResize);
          renderer.dispose();
      };
  }, []);

  return (
      <div ref={containerRef} style={{ height: '400vh', position: 'relative' }}>
          {/* Progress bar */}
          <motion.div style={{
              position: 'fixed', top: 0, left: 0, height: 2,
              background: '#000', zIndex: 1, width: progressWidth
          }} />

          {/* Welcome text */}
          <motion.div style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)', zIndex: 20,
              textAlign: 'center', pointerEvents: 'none',
              opacity: textOpacity
          }}>
              <motion.h1 style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 'clamp(2rem, 8vw, 5rem)',
                  fontWeight: 'bold',
                  letterSpacing: 'clamp(5px, 2vw, 15px)',
                  textTransform: 'uppercase',
                  color: '#000', margin: 0,
                  filter: useTransform(textBlurVal, v => `blur(${v}px)`)
              }}>
                  Welcome to BASE
              </motion.h1>
          </motion.div>

          {/* Canvas */}
          <motion.div style={{
              position: 'fixed', top: 0, left: 0,
              width: '100vw', height: '100vh', zIndex: 1,
              filter: useTransform([introBlur, endBlur, smoothProgress], ([intro, end, p]) => {
                  if (p <= 0.15) return `blur(${intro}px)`;
                  if (p >= 0.75) return `blur(${end}px)`;
                  return 'blur(0px)';
              })
          }}>
              <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
          </motion.div>

          {/* Scroll indicator */}
          <motion.div style={{
              position: 'fixed', bottom: 30, left: '50%',
              transform: 'translateX(-50%)', zIndex: 10,
              color: '#000', fontSize: '0.75rem',
              letterSpacing: 3, textTransform: 'uppercase',
              opacity: indicatorOpacity, pointerEvents: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
              <span>Scroll to explore</span>
              <motion.div
                  style={{ width: 1, height: 30, background: '#000', marginTop: 10 }}
                  animate={{ scaleY: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
          </motion.div>
      </div>
  );
}

