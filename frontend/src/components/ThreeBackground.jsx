import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Generate deterministic random positions
const generateParticlePositions = (count) => {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const t = i / count
    positions[i * 3] = (Math.sin(t * 12.9898) * 43758.5453 % 1 - 0.5) * 15
    positions[i * 3 + 1] = (Math.cos(t * 78.233) * 43758.5453 % 1 - 0.5) * 15
    positions[i * 3 + 2] = (Math.sin(t * 43.123) * 43758.5453 % 1 - 0.5) * 10
  }
  return positions
}

const PARTICLE_POSITIONS = generateParticlePositions(100)


function ParticleField() {
  const pointsRef = useRef()

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={100}
          array={PARTICLE_POSITIONS}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#22d3ee"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

function GlowOrbs() {
  const orb1Ref = useRef()
  const orb2Ref = useRef()

  useFrame((state) => {
    if (orb1Ref.current) {
      orb1Ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.4) * 2
      orb1Ref.current.position.y = Math.cos(state.clock.elapsedTime * 0.3) * 1.5
    }
    if (orb2Ref.current) {
      orb2Ref.current.position.x = Math.cos(state.clock.elapsedTime * 0.35) * 2.5
      orb2Ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 1.8
    }
  })

  return (
    <>
      <mesh ref={orb1Ref} position={[-3, 1, -2]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.15}
        />
      </mesh>
      <mesh ref={orb2Ref} position={[3, -1, -1]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.12}
        />
      </mesh>
    </>
  )
}

export default function ThreeBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <canvas className="absolute! inset-0 h-full w-full">
        {/* Scene setup with orthographic-like perspective for image display */}
      </canvas>
      <div className="absolute inset-0 h-full w-full">
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(11, 11, 15, 0.3) 70%, rgba(11, 11, 15, 0.8) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}

// Export the actual 3D scene component for use with Canvas
export function ThreeScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} color="#a855f7" intensity={0.5} />
      <ParticleField />
      <GlowOrbs />
    </>
  )
}
