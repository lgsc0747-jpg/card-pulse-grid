import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Text, Float } from "@react-three/drei";
import * as THREE from "three";

function CardMesh({ name, status }: { name: string; status: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useFrame(({ pointer }) => {
    if (!groupRef.current) return;
    mouseRef.current.x = THREE.MathUtils.lerp(mouseRef.current.x, pointer.x * 0.3, 0.05);
    mouseRef.current.y = THREE.MathUtils.lerp(mouseRef.current.y, pointer.y * 0.2, 0.05);
    groupRef.current.rotation.y = mouseRef.current.x;
    groupRef.current.rotation.x = -mouseRef.current.y;
  });

  return (
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={groupRef}>
        {/* Card body */}
        <RoundedBox args={[3.4, 2.1, 0.08]} radius={0.12} smoothness={4}>
          <meshPhysicalMaterial
            color="#0d9488"
            metalness={0.3}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={1.5}
          />
        </RoundedBox>

        {/* NFC icon circle */}
        <mesh position={[-1.1, 0.4, 0.05]}>
          <circleGeometry args={[0.25, 32]} />
          <meshStandardMaterial color="#ffffff" opacity={0.2} transparent />
        </mesh>

        {/* Name text */}
        <Text
          position={[0, -0.15, 0.05]}
          fontSize={0.22}
          color="#ffffff"
          font="/fonts/SpaceGrotesk-Bold.ttf"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.8}
        >
          {name || "Your Name"}
        </Text>

        {/* Status text */}
        <Text
          position={[0, -0.5, 0.05]}
          fontSize={0.12}
          color="#99f6e4"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.8}
        >
          {status || "Available"}
        </Text>

        {/* NFC HUB branding */}
        <Text
          position={[1.2, 0.75, 0.05]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="right"
          anchorY="middle"
          letterSpacing={0.15}
        >
          NFC HUB
        </Text>
      </group>
    </Float>
  );
}

export function FloatingCard3D({ name, status }: { name: string; status: string }) {
  return (
    <div className="w-full h-[320px] md:h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, -3, 2]} intensity={0.5} color="#06b6d4" />
        <CardMesh name={name} status={status} />
      </Canvas>
    </div>
  );
}
