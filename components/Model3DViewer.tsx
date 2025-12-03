import React, { useRef, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Float,
  MeshDistortMaterial,
  Sphere,
  Box,
  Torus,
  Html,
  PerspectiveCamera
} from '@react-three/drei';
import * as THREE from 'three';
import { PostProcessingEffects } from './PostProcessingEffects';

// Types for hotspots
export interface Hotspot {
  id: string;
  position: [number, number, number];
  label: string;
  description: string;
  color?: string;
}

interface Model3DViewerProps {
  modelType: 'muscle' | 'myokine' | 'cell';
  hotspots?: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
  activeColor?: string;
}

// Animated hotspot marker
function HotspotMarker({
  hotspot,
  onClick,
  isHovered,
  onHover
}: {
  hotspot: Hotspot;
  onClick: () => void;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.setScalar(isHovered ? 1.3 : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <group position={hotspot.position}>
      <mesh
        ref={ref}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={hotspot.color || '#3b82f6'}
          emissive={hotspot.color || '#3b82f6'}
          emissiveIntensity={isHovered ? 1 : 0.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Pulse ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.25, 32]} />
        <meshBasicMaterial
          color={hotspot.color || '#3b82f6'}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Label on hover */}
      {isHovered && (
        <Html
          position={[0, 0.4, 0]}
          center
          style={{
            background: 'rgba(0,0,0,0.8)',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '10px',
            color: 'white',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {hotspot.label}
        </Html>
      )}
    </group>
  );
}

// Muscle Fiber Model (Procedural)
function MuscleFiberModel({ color = '#ef4444' }: { color?: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  // Create fiber strands
  const fibers = Array.from({ length: 12 }, (_, i) => ({
    position: [
      Math.cos((i / 12) * Math.PI * 2) * 0.8,
      0,
      Math.sin((i / 12) * Math.PI * 2) * 0.8
    ] as [number, number, number],
    scale: 0.15 + Math.random() * 0.05,
  }));

  return (
    <group ref={groupRef}>
      {/* Central core */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 3, 32]} />
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={0.2}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Surrounding fibers */}
      {fibers.map((fiber, i) => (
        <mesh key={i} position={fiber.position}>
          <cylinderGeometry args={[fiber.scale, fiber.scale, 2.8, 16]} />
          <meshStandardMaterial
            color={color}
            roughness={0.6}
            metalness={0.2}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Outer membrane (epimysium) */}
      <mesh>
        <cylinderGeometry args={[1.2, 1.2, 3.2, 32, 1, true]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>
    </group>
  );
}

// Myokine Molecule Model (Procedural)
function MyokineModel({ color = '#a855f7' }: { color?: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Core sphere */}
        <Sphere args={[0.5, 32, 32]}>
          <MeshDistortMaterial
            color={color}
            speed={3}
            distort={0.4}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>

        {/* Orbiting particles */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <group key={i} rotation={[0, (i / 6) * Math.PI * 2, Math.PI / 4]}>
            <mesh position={[1.2, 0, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        ))}

        {/* Energy rings */}
        <Torus args={[0.9, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
          />
        </Torus>
        <Torus args={[1.1, 0.015, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.3}
            transparent
            opacity={0.4}
          />
        </Torus>
      </group>
    </Float>
  );
}

// Cell Model (Procedural)
function CellModel({ color = '#10b981' }: { color?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const nucleusRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
    if (nucleusRef.current) {
      nucleusRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      nucleusRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  // Mitochondria positions
  const mitochondria = [
    { pos: [0.6, 0.3, 0.4], rot: [0, 0.5, 0.3] },
    { pos: [-0.5, -0.2, 0.5], rot: [0.3, 0, 0.5] },
    { pos: [0.3, -0.4, -0.5], rot: [0.2, 0.4, 0] },
    { pos: [-0.4, 0.5, -0.3], rot: [0, 0.2, 0.4] },
  ];

  return (
    <group ref={groupRef}>
      {/* Cell membrane */}
      <Sphere args={[1.3, 64, 64]}>
        <MeshDistortMaterial
          color={color}
          speed={1.5}
          distort={0.15}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Nucleus */}
      <mesh ref={nucleusRef}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <MeshDistortMaterial
          color="#3b82f6"
          speed={2}
          distort={0.3}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Mitochondria */}
      {mitochondria.map((mito, i) => (
        <mesh
          key={i}
          position={mito.pos as [number, number, number]}
          rotation={mito.rot as [number, number, number]}
        >
          <capsuleGeometry args={[0.08, 0.2, 8, 16]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.3}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* Endoplasmic reticulum (simplified) */}
      <mesh position={[0.2, 0.1, 0.3]}>
        <torusKnotGeometry args={[0.15, 0.03, 64, 8, 2, 3]} />
        <meshStandardMaterial
          color="#06b6d4"
          transparent
          opacity={0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

// Ambient Particles - floating energy particles
function AmbientParticles({ count = 50, color = '#3b82f6' }: { count?: number; color?: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ],
        speed: 0.2 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();

    particles.forEach((particle, i) => {
      const [x, y, z] = particle.position;
      dummy.position.set(
        x + Math.sin(time * particle.speed + particle.offset) * 0.5,
        y + Math.cos(time * particle.speed + particle.offset) * 0.5,
        z + Math.sin(time * particle.speed * 0.5) * 0.3
      );
      dummy.scale.setScalar(0.02 + Math.sin(time * 2 + particle.offset) * 0.01);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </instancedMesh>
  );
}

// Main 3D Viewer Component
export default function Model3DViewer({
  modelType,
  hotspots = [],
  onHotspotClick,
  activeColor = '#3b82f6'
}: Model3DViewerProps) {
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  const handleHotspotClick = (hotspot: Hotspot) => {
    if (onHotspotClick) {
      onHotspotClick(hotspot);
    }
  };

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden bg-gradient-to-b from-zinc-900 to-black border border-white/10">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          autoRotate
          autoRotateSpeed={0.5}
        />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color={activeColor} />
        <spotLight
          position={[0, 5, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color={activeColor}
        />

        {/* Environment for reflections */}
        <Environment preset="night" />

        {/* Ambient floating particles */}
        <AmbientParticles count={40} color={activeColor} />

        {/* Model based on type */}
        <Suspense fallback={null}>
          {modelType === 'muscle' && <MuscleFiberModel color="#ef4444" />}
          {modelType === 'myokine' && <MyokineModel color={activeColor} />}
          {modelType === 'cell' && <CellModel color="#10b981" />}
        </Suspense>

        {/* Hotspots */}
        {hotspots.map((hotspot) => (
          <HotspotMarker
            key={hotspot.id}
            hotspot={hotspot}
            onClick={() => handleHotspotClick(hotspot)}
            isHovered={hoveredHotspot === hotspot.id}
            onHover={(hovered) => setHoveredHotspot(hovered ? hotspot.id : null)}
          />
        ))}

        {/* Post-processing effects */}
        <PostProcessingEffects intensity={0.8} bloomIntensity={0.5} />
      </Canvas>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 text-[10px] text-zinc-500 font-mono">
        <span className="bg-zinc-900/80 px-2 py-1 rounded border border-white/10">
          Arrastra para rotar • Scroll para zoom • Click en puntos para explorar
        </span>
      </div>
    </div>
  );
}

// Predefined hotspots for each model type
export const MUSCLE_HOTSPOTS: Hotspot[] = [
  { id: 'sarcomere', position: [0, 1, 0.5], label: 'Sarcómero', description: 'Unidad funcional del músculo. Contiene actina y miosina.', color: '#ef4444' },
  { id: 'myofibrils', position: [0.8, 0, 0.3], label: 'Miofibrillas', description: 'Fibras contráctiles que generan fuerza muscular.', color: '#f59e0b' },
  { id: 'membrane', position: [1.1, -0.5, 0], label: 'Sarcolema', description: 'Membrana celular que transmite señales eléctricas.', color: '#3b82f6' },
];

export const MYOKINE_HOTSPOTS: Hotspot[] = [
  { id: 'irisin', position: [1.2, 0, 0], label: 'Irisin', description: 'Convierte grasa blanca en grasa parda. Quema calorías.', color: '#10b981' },
  { id: 'bdnf', position: [-1.2, 0, 0], label: 'BDNF', description: 'Factor neurotrófico. Mejora memoria y neuroplasticidad.', color: '#a855f7' },
  { id: 'il6', position: [0, 1.2, 0], label: 'IL-6', description: 'Antiinflamatorio cuando viene del músculo activo.', color: '#06b6d4' },
];

export const CELL_HOTSPOTS: Hotspot[] = [
  { id: 'nucleus', position: [0, 0, 0.5], label: 'Núcleo', description: 'Centro de control. Contiene el ADN celular.', color: '#3b82f6' },
  { id: 'mitochondria', position: [0.6, 0.3, 0.4], label: 'Mitocondria', description: 'Central energética. Produce ATP para la contracción.', color: '#f59e0b' },
  { id: 'membrane', position: [0, 1.2, 0], label: 'Membrana', description: 'Barrera selectiva. Regula entrada/salida de sustancias.', color: '#10b981' },
];
