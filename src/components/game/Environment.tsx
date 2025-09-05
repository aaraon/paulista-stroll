import { useRef, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { useBox } from '@react-three/cannon'
import * as THREE from 'three'

// São Paulo landmarks data
const landmarks = [
  {
    id: 'masp',
    name: 'MASP - Museu de Arte',
    position: [-20, 0, -30],
    size: [25, 12, 8],
    color: '#8B0000', // Dark red for MASP's iconic color
  },
  {
    id: 'bank-building-1',
    name: 'Edifício Copacabana',
    position: [15, 0, -25],
    size: [12, 35, 8],
    color: '#4A5568', // Grey concrete
  },
  {
    id: 'bank-building-2', 
    name: 'Centro Empresarial',
    position: [30, 0, -10],
    size: [10, 28, 12],
    color: '#2D3748', // Darker concrete
  },
  {
    id: 'shopping-center',
    name: 'Shopping Paulista',
    position: [-35, 0, 10],
    size: [20, 15, 15],
    color: '#4299E1', // Blue glass
  }
]

const Building = ({ position, size, color, name }: any) => {
  const [buildingRef] = useBox(() => ({
    position,
    args: size,
    type: 'Static',
    material: 'building',
  }))

  return (
    <mesh ref={buildingRef as any} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshLambertMaterial color={color} />
      {/* Building label (visible when close) */}
      <mesh position={[0, size[1]/2 + 2, 0]}>
        {/* This would be replaced with proper 3D text in production */}
      </mesh>
    </mesh>
  )
}

const Sidewalk = ({ position, size }: { position: [number, number, number], size: [number, number, number] }) => {
  const [sidewalkRef] = useBox(() => ({
    position,
    args: size,
    type: 'Static',
    material: 'sidewalk',
  }))

  return (
    <mesh ref={sidewalkRef as any} receiveShadow>
      <boxGeometry args={size} />
      <meshLambertMaterial color="#E2E8F0" />
    </mesh>
  )
}

const Street = ({ position, size }: { position: [number, number, number], size: [number, number, number] }) => {
  const [streetRef] = useBox(() => ({
    position,
    args: size,
    type: 'Static', 
    material: 'street',
  }))

  return (
    <mesh ref={streetRef as any} receiveShadow>
      <boxGeometry args={size} />
      <meshLambertMaterial color="#4A5568" />
    </mesh>
  )
}

const Crosswalk = ({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* White crosswalk stripes */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[0, 0.01, (i - 3.5) * 0.8]} receiveShadow>
          <boxGeometry args={[4, 0.01, 0.4]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
      ))}
    </group>
  )
}

export const Environment = () => {
  // Ground plane
  const [groundRef] = useBox(() => ({
    position: [0, -0.5, 0],
    args: [200, 1, 200],
    type: 'Static',
    material: 'ground',
  }))

  return (
    <group>
      {/* Ground */}
      <mesh ref={groundRef as any} receiveShadow>
        <boxGeometry args={[200, 1, 200]} />
        <meshLambertMaterial color="#718096" />
      </mesh>

      {/* Main Avenida Paulista */}
      <Street position={[0, 0, 0]} size={[100, 0.1, 12]} />
      
      {/* Side streets */}
      <Street position={[0, 0, -40]} size={[100, 0.1, 8]} />
      <Street position={[0, 0, 40]} size={[100, 0.1, 8]} />
      
      {/* Perpendicular streets */}
      <Street position={[-50, 0, 0]} size={[8, 0.1, 100]} />
      <Street position={[50, 0, 0]} size={[8, 0.1, 100]} />

      {/* Sidewalks along Avenida Paulista */}
      <Sidewalk position={[0, 0.1, 8]} size={[100, 0.2, 4]} />
      <Sidewalk position={[0, 0.1, -8]} size={[100, 0.2, 4]} />
      
      {/* Cross sidewalks */}
      <Sidewalk position={[25, 0.1, 0]} size={[4, 0.2, 12]} />
      <Sidewalk position={[-25, 0.1, 0]} size={[4, 0.2, 12]} />

      {/* Crosswalks */}
      <Crosswalk position={[25, 0, 0]} />
      <Crosswalk position={[-25, 0, 0]} />
      <Crosswalk position={[0, 0, 20]} rotation={Math.PI / 2} />
      <Crosswalk position={[0, 0, -20]} rotation={Math.PI / 2} />

      {/* São Paulo Buildings/Landmarks */}
      {landmarks.map((landmark) => (
        <Building
          key={landmark.id}
          position={landmark.position}
          size={landmark.size}
          color={landmark.color}
          name={landmark.name}
        />
      ))}

      {/* Street furniture */}
      {/* Bus stops */}
      <mesh position={[8, 1, 15]} castShadow>
        <boxGeometry args={[3, 2, 1]} />
        <meshLambertMaterial color="#2D3748" />
      </mesh>
      
      {/* Traffic lights */}
      <mesh position={[25, 3, 6]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 6]} />
        <meshLambertMaterial color="#4A5568" />
      </mesh>

      {/* Bollards for pedestrian safety */}
      {[-30, -20, -10, 10, 20, 30].map(x => (
        <mesh key={x} position={[x, 0.5, 6]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 1]} />
          <meshLambertMaterial color="#E2E8F0" />
        </mesh>
      ))}
    </group>
  )
}