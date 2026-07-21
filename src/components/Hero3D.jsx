import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Text } from '@react-three/drei';

const FloatingShapes = () => {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t / 4) / 2;
    groupRef.current.rotation.x = Math.cos(t / 4) / 2;
  });

  return (
    <group ref={groupRef}>
      {/* Central abstracted core (represents CPU/Algorithm) */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[1.5, 0]} />
          <MeshDistortMaterial 
            color="#ccff00" 
            wireframe 
            distort={0.4} 
            speed={2} 
            thickness={2}
          />
        </mesh>
      </Float>

      {/* Orbiting data points */}
      {[...Array(20)].map((_, i) => {
        const theta = (i / 20) * Math.PI * 2;
        const radius = 3 + Math.random();
        return (
          <Float key={i} speed={1 + Math.random()} rotationIntensity={2} floatIntensity={1}>
            <mesh position={[Math.cos(theta) * radius, Math.sin(theta) * radius, (Math.random() - 0.5) * 4]}>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshBasicMaterial color="#333333" />
            </mesh>
          </Float>
        );
      })}

      {/* Code snippets floating in background */}
      <Float speed={0.5}>
        <Text 
          position={[-3, 2, -2]} 
          fontSize={0.2} 
          color="#444444" 
          font="https://fonts.gstatic.com/s/spacemono/v12/i7dMIFZifjKcF5UAWdDRYEF8RQ.woff"
        >
          O(N log N)
        </Text>
        <Text 
          position={[3, -2, -1]} 
          fontSize={0.2} 
          color="#444444"
          font="https://fonts.gstatic.com/s/spacemono/v12/i7dMIFZifjKcF5UAWdDRYEF8RQ.woff"
        >
          SELECT * FROM gate_pyq;
        </Text>
      </Float>
    </group>
  );
};

const Hero3D = () => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <FloatingShapes />
      </Canvas>
    </div>
  );
};

export default Hero3D;
