import { useRef, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { useBox } from '@react-three/cannon'
import * as THREE from 'three'

// São Paulo landmarks data (excluding MASP - will be rendered separately)
const landmarks = [
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

// Specialized MASP Building Component
const MASPBuilding = ({ position }: { position: [number, number, number] }) => {
  const [x, y, z] = position
  
  // Main suspended red block
  const blockWidth = 25
  const blockHeight = 8
  const blockDepth = 8
  const blockY = 10 // Suspended height
  
  // Four external pillars
  const pillarWidth = 2
  const pillarHeight = blockY + blockHeight/2
  const pillarPositions: [number, number, number][] = [
    [x - blockWidth/2 + pillarWidth/2, pillarHeight/2, z - blockDepth/2 + pillarWidth/2],
    [x + blockWidth/2 - pillarWidth/2, pillarHeight/2, z - blockDepth/2 + pillarWidth/2], 
    [x - blockWidth/2 + pillarWidth/2, pillarHeight/2, z + blockDepth/2 - pillarWidth/2],
    [x + blockWidth/2 - pillarWidth/2, pillarHeight/2, z + blockDepth/2 - pillarWidth/2]
  ]

  // Physics bodies
  const [mainBlockRef] = useBox(() => ({
    position: [x, y + blockY, z],
    args: [blockWidth, blockHeight, blockDepth],
    type: 'Static',
  }))

  // Individual pillar physics bodies (can't use hooks in loops)
  const [pillar1Ref] = useBox(() => ({
    position: pillarPositions[0],
    args: [pillarWidth, pillarHeight, pillarWidth],
    type: 'Static',
  }))
  
  const [pillar2Ref] = useBox(() => ({
    position: pillarPositions[1],
    args: [pillarWidth, pillarHeight, pillarWidth],
    type: 'Static',
  }))
  
  const [pillar3Ref] = useBox(() => ({
    position: pillarPositions[2],
    args: [pillarWidth, pillarHeight, pillarWidth],
    type: 'Static',
  }))
  
  const [pillar4Ref] = useBox(() => ({
    position: pillarPositions[3],
    args: [pillarWidth, pillarHeight, pillarWidth],
    type: 'Static',
  }))

  return (
    <group>
      {/* Main suspended red block */}
      <mesh ref={mainBlockRef as any} position={[x, y + blockY, z]} castShadow receiveShadow>
        <boxGeometry args={[blockWidth, blockHeight, blockDepth]} />
        <meshPhongMaterial color="#8B0000" shininess={30} />
      </mesh>

      {/* Four external red pillars */}
      <mesh ref={pillar1Ref as any} position={pillarPositions[0]} castShadow receiveShadow>
        <boxGeometry args={[pillarWidth, pillarHeight, pillarWidth]} />
        <meshPhongMaterial color="#8B0000" shininess={30} />
      </mesh>
      <mesh ref={pillar2Ref as any} position={pillarPositions[1]} castShadow receiveShadow>
        <boxGeometry args={[pillarWidth, pillarHeight, pillarWidth]} />
        <meshPhongMaterial color="#8B0000" shininess={30} />
      </mesh>
      <mesh ref={pillar3Ref as any} position={pillarPositions[2]} castShadow receiveShadow>
        <boxGeometry args={[pillarWidth, pillarHeight, pillarWidth]} />
        <meshPhongMaterial color="#8B0000" shininess={30} />
      </mesh>
      <mesh ref={pillar4Ref as any} position={pillarPositions[3]} castShadow receiveShadow>
        <boxGeometry args={[pillarWidth, pillarHeight, pillarWidth]} />
        <meshPhongMaterial color="#8B0000" shininess={30} />
      </mesh>

      {/* Two thick horizontal internal beams at 1st-2nd floor level */}
      <mesh position={[x, y + blockY - 1, z - blockDepth/4]} castShadow receiveShadow>
        <boxGeometry args={[blockWidth - 4, 1.5, 1]} />
        <meshPhongMaterial color="#6B0000" shininess={20} />
      </mesh>
      <mesh position={[x, y + blockY - 1, z + blockDepth/4]} castShadow receiveShadow>
        <boxGeometry args={[blockWidth - 4, 1.5, 1]} />
        <meshPhongMaterial color="#6B0000" shininess={20} />
      </mesh>

      {/* Slim external roof beam (thinner than internal) */}
      <mesh position={[x, y + blockY + blockHeight/2 + 0.25, z]} castShadow receiveShadow>
        <boxGeometry args={[blockWidth + 2, 0.5, blockDepth + 1]} />
        <meshPhongMaterial color="#7A0000" shininess={25} />
      </mesh>

      {/* Blue grid windows on front façade */}
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => (
          <mesh 
            key={`window-front-${row}-${col}`}
            position={[
              x - blockWidth/2 + (col + 0.5) * (blockWidth / 8),
              y + blockY - blockHeight/2 + (row + 0.5) * (blockHeight / 4),
              z + blockDepth/2 + 0.01
            ]}
          >
            <planeGeometry args={[2.5, 1.5]} />
            <meshPhongMaterial 
              color="#4299E1"
              transparent
              opacity={0.6}
            />
          </mesh>
        ))
      )}

      {/* Blue grid windows on back façade */}
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => (
          <mesh 
            key={`window-back-${row}-${col}`}
            position={[
              x - blockWidth/2 + (col + 0.5) * (blockWidth / 8),
              y + blockY - blockHeight/2 + (row + 0.5) * (blockHeight / 4),
              z - blockDepth/2 - 0.01
            ]}
            rotation={[0, Math.PI, 0]}
          >
            <planeGeometry args={[2.5, 1.5]} />
            <meshPhongMaterial 
              color="#4299E1"
              transparent
              opacity={0.6}
            />
          </mesh>
        ))
      )}

      {/* Adjacent tall dark-grey cuboid tower */}
      <mesh position={[x + 35, y + 20, z]} castShadow receiveShadow>
        <boxGeometry args={[12, 40, 10]} />
        <meshPhongMaterial color="#2D3748" shininess={15} />
      </mesh>

      {/* Tower windows */}
      {Array.from({ length: 12 }, (_, row) =>
        Array.from({ length: 3 }, (_, col) => (
          <mesh 
            key={`tower-window-${row}-${col}`}
            position={[
              x + 35 - 6 + (col + 0.5) * 4,
              y + 2 + row * 3,
              z + 5.01
            ]}
          >
            <planeGeometry args={[2, 2]} />
            <meshPhongMaterial 
              color="#87CEEB"
              transparent
              opacity={0.7}
            />
          </mesh>
        ))
      )}
    </group>
  )
}

const Building = ({ position, size, color, name }: any) => {
  const [buildingRef] = useBox(() => ({
    position,
    args: size,
    type: 'Static',
    material: 'building',
  }))

  // Create more detailed building with higher polygon count
  const windowColor = '#87CEEB'
  const windowRows = Math.floor(size[1] / 3)
  const windowCols = Math.max(3, Math.floor(size[0] / 2))

  return (
    <group>
      {/* Main building structure with higher resolution */}
      <mesh ref={buildingRef as any} castShadow receiveShadow>
        <boxGeometry args={[size[0], size[1], size[2]]} />
        <meshPhongMaterial 
          color={color}
          shininess={30}
        />
      </mesh>
      
      {/* Windows for more realistic appearance */}
      {Array.from({ length: windowRows }, (_, row) =>
        Array.from({ length: windowCols }, (_, col) => (
          <mesh 
            key={`${row}-${col}`} 
            position={[
              position[0] - size[0]/2 + (col + 0.5) * (size[0] / windowCols),
              position[1] - size[1]/2 + (row + 0.5) * (size[1] / windowRows),
              position[2] + size[2]/2 + 0.01
            ]}
            castShadow
          >
            <planeGeometry args={[size[0] / windowCols * 0.7, size[1] / windowRows * 0.7]} />
            <meshPhongMaterial 
              color={Math.random() > 0.3 ? windowColor : '#2C5282'}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))
      )}
      
      {/* Rooftop details */}
      <mesh position={[position[0], position[1] + size[1]/2 + 0.5, position[2]]} castShadow>
        <boxGeometry args={[size[0] * 0.9, 1, size[2] * 0.9]} />
        <meshPhongMaterial color="#4A5568" />
      </mesh>
    </group>
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
      <boxGeometry args={[size[0], size[1], size[2], 8, 1, 8]} />
      <meshStandardMaterial 
        color="#E2E8F0"
        roughness={0.8}
      />
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
      <boxGeometry args={[size[0], size[1], size[2], 12, 1, 12]} />
      <meshStandardMaterial 
        color="#4A5568"
        roughness={0.9}
      />
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
        <boxGeometry args={[200, 1, 200, 20, 1, 20]} />
        <meshStandardMaterial 
          color="#718096"
          roughness={0.8}
        />
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

      {/* MASP - Museu de Arte de São Paulo with detailed architecture */}
      <MASPBuilding position={[-20, 0, -30]} />

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