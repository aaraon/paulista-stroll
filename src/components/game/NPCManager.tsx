import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useBox } from '@react-three/cannon'
import * as THREE from 'three'

interface NPCState {
  id: string
  position: THREE.Vector3
  target: THREE.Vector3
  state: 'idle' | 'walking' | 'waiting' | 'crossing' | 'avoiding'
  speed: number
  idleTime: number
  mesh?: THREE.Mesh
}

const NPC_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
]

const SingleNPC = ({ npc, playerPosition }: { npc: NPCState, playerPosition?: THREE.Vector3 }) => {
  const [npcRef] = useBox(() => ({
    mass: 60,
    position: [npc.position.x, npc.position.y, npc.position.z],
    args: [0.5, 1.6, 0.5], // width, height, depth
    material: 'npc',
    linearDamping: 10,
    angularDamping: 10,
    fixedRotation: true,
  }))

  const meshRef = useRef<THREE.Mesh>(null!)
  const color = useMemo(() => NPC_COLORS[parseInt(npc.id) % NPC_COLORS.length], [npc.id])

  useFrame((state, delta) => {
    if (!npcRef.current || !meshRef.current) return

    const currentPos = npcRef.current && 'position' in npcRef.current ? 
      new THREE.Vector3(...(npcRef.current as any).position) : 
      new THREE.Vector3()
    npc.position.copy(currentPos)

    // Basic AI state machine
    switch (npc.state) {
      case 'walking':
        const direction = npc.target.clone().sub(currentPos).normalize()
        const distanceToTarget = currentPos.distanceTo(npc.target)

        if (distanceToTarget < 2) {
          // Reached target, pick new one or go idle
          if (Math.random() < 0.3) {
            npc.state = 'idle'
            npc.idleTime = Math.random() * 3 + 1 // 1-4 seconds
          } else {
            // Pick new target on sidewalk
            npc.target = getRandomSidewalkPoint()
          }
        } else {
          // Player avoidance
          if (playerPosition) {
            const playerDistance = currentPos.distanceTo(playerPosition)
            if (playerDistance < 3) {
              const avoidDirection = currentPos.clone().sub(playerPosition).normalize()
              direction.add(avoidDirection.multiplyScalar(0.5))
              direction.normalize()
            }
          }

          // Move towards target
          const velocity = direction.multiplyScalar(npc.speed * delta * 20)
          if (npcRef.current && 'velocity' in npcRef.current) {
            (npcRef.current as any).velocity.set(velocity.x, 0, velocity.z)
          }

          // Face movement direction
          const angle = Math.atan2(direction.x, direction.z)
          meshRef.current.rotation.y = angle
        }
        break

      case 'idle':
        npc.idleTime -= delta
        if (npcRef.current && 'velocity' in npcRef.current) {
          (npcRef.current as any).velocity.set(0, 0, 0)
        }
        
        if (npc.idleTime <= 0) {
          npc.state = 'walking'
          npc.target = getRandomSidewalkPoint()
        }
        break
    }
  })

  return (
    <mesh ref={meshRef} position={npc.position.toArray()} castShadow>
      <boxGeometry args={[0.5, 1.6, 0.5]} />
      <meshLambertMaterial color={color} />
      {/* Simple hat/head indicator */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.15]} />
        <meshLambertMaterial color={color} />
      </mesh>
    </mesh>
  )
}

// Sidewalk areas where NPCs can walk (avoiding streets)
const SIDEWALK_AREAS = [
  { min: { x: -50, z: 8 }, max: { x: 50, z: 12 } },    // North sidewalk
  { min: { x: -50, z: -12 }, max: { x: 50, z: -8 } },  // South sidewalk
  { min: { x: -30, z: -8 }, max: { x: -26, z: 8 } },   // West crosswalk area
  { min: { x: 26, z: -8 }, max: { x: 30, z: 8 } },     // East crosswalk area
]

const getRandomSidewalkPoint = (): THREE.Vector3 => {
  const area = SIDEWALK_AREAS[Math.floor(Math.random() * SIDEWALK_AREAS.length)]
  return new THREE.Vector3(
    Math.random() * (area.max.x - area.min.x) + area.min.x,
    1,
    Math.random() * (area.max.z - area.min.z) + area.min.z
  )
}

export const NPCManager = () => {
  const playerRef = useRef<THREE.Vector3>()
  
  // Initialize NPCs
  const [npcs] = useState<NPCState[]>(() => {
    const npcArray: NPCState[] = []
    
    // Create 15-20 pedestrians
    for (let i = 0; i < Math.floor(Math.random() * 6) + 15; i++) {
      const position = getRandomSidewalkPoint()
      npcArray.push({
        id: i.toString(),
        position,
        target: getRandomSidewalkPoint(), 
        state: Math.random() < 0.7 ? 'walking' : 'idle',
        speed: Math.random() * 0.5 + 0.8, // 0.8 - 1.3 speed multiplier
        idleTime: Math.random() * 2 + 1,
      })
    }
    
    return npcArray
  })

  // Track player position for NPC avoidance
  useFrame(({ camera }) => {
    playerRef.current = camera.position
  })

  return (
    <group>
      {npcs.map(npc => (
        <SingleNPC
          key={npc.id}
          npc={npc}
          playerPosition={playerRef.current}
        />
      ))}
    </group>
  )
}