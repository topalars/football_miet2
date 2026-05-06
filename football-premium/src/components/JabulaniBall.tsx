'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

function makePanelTexture() {
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, size, size);

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 1.4);
  grad.addColorStop(0, 'rgba(57,255,106,0.05)');
  grad.addColorStop(1, 'rgba(0,0,0,0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 3;
  const cell = size / 8;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const x = i * cell;
      const y = j * cell;
      const r = cell * 0.42;
      ctx.beginPath();
      const sides = 6;
      for (let k = 0; k <= sides; k++) {
        const a = (k / sides) * Math.PI * 2 + (j % 2 ? Math.PI / sides : 0);
        const px = x + cell / 2 + Math.cos(a) * r;
        const py = y + cell / 2 + Math.sin(a) * r;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = 6;
  for (let i = 0; i < 4; i++) {
    const t = (i / 4) * size;
    ctx.beginPath();
    ctx.moveTo(0, t);
    ctx.bezierCurveTo(size / 3, t + size / 8, (2 * size) / 3, t - size / 8, size, t);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function Ball() {
  const mesh = useRef<THREE.Mesh>(null);
  const map = useMemo(() => makePanelTexture(), []);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.18;
    mesh.current.rotation.x += delta * 0.05;

    const px = THREE.MathUtils.clamp(state.pointer.x, -1, 1);
    const py = THREE.MathUtils.clamp(state.pointer.y, -1, 1);
    const tx = -py * 0.18;
    const tz = px * 0.18;
    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, mesh.current.rotation.x + (tx - mesh.current.rotation.x) * 0.04, 1);
    mesh.current.rotation.z = THREE.MathUtils.lerp(mesh.current.rotation.z, tz, 0.05);
  });

  return (
    <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.35} floatingRange={[-0.04, 0.04]}>
      <mesh ref={mesh} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 12]} />
        <meshPhysicalMaterial
          map={map}
          color="#ffffff"
          metalness={0.15}
          roughness={0.28}
          clearcoat={1}
          clearcoatRoughness={0.08}
          sheen={1}
          sheenColor={new THREE.Color('#39FF6A')}
          sheenRoughness={0.5}
          envMapIntensity={1.1}
        />
      </mesh>
    </Float>
  );
}

export default function JabulaniBall() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 3.4], fov: 35 }}
      shadows
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 5, 5]} intensity={1.4} castShadow />
      <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#39FF6A" />
      <directionalLight position={[0, 4, -5]} intensity={0.5} color="#5fa0ff" />

      <Suspense fallback={null}>
        <Ball />
        <Environment preset="studio" />
        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.4}
          scale={6}
          blur={2.6}
          far={2.4}
          color="#39FF6A"
        />
      </Suspense>
    </Canvas>
  );
}
