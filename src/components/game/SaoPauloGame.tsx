import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { Sky, Stats, KeyboardControls } from '@react-three/drei'
import { Suspense, useState, useEffect } from 'react'
import { Player } from './Player'
import { Environment } from './Environment'
import { NPCManager } from './NPCManager'
import { GameHUD } from './GameHUD'
import { GameAudio } from './GameAudio'
import { PlayerTracker } from './PlayerTracker'
import * as THREE from 'three'

const keyMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'sprint', keys: ['ShiftLeft'] },
  { name: 'jump', keys: ['Space'] },
]

// Function to check WebGL availability
const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!context
  } catch (e) {
    return false
  }
}

export const SaoPauloGame = () => {
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3())
  const [fps, setFps] = useState(0)
  const [webglError, setWebglError] = useState<string | null>(null)

  // Check WebGL support on component mount
  useEffect(() => {
    if (!checkWebGLSupport()) {
      setWebglError('WebGL is not supported or is disabled in your browser. Please enable hardware acceleration or try a different browser.')
    }
  }, [])

  // Handle WebGL context creation errors
  const handleCreated = ({ gl }: { gl: THREE.WebGLRenderer }) => {
    console.log('WebGL context created successfully')
  }

  const handleError = (error: any) => {
    console.error('WebGL Error:', error)
    setWebglError('Your device does not support WebGL or it is disabled. Please enable hardware acceleration in your browser settings.')
  }

  if (webglError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-xl font-semibold mb-4">WebGL Not Available</h2>
          <p className="text-muted-foreground mb-4">{webglError}</p>
          <p className="text-sm text-muted-foreground">
            Try refreshing the page or enabling hardware acceleration in your browser settings.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen relative">
      <KeyboardControls map={keyMap}>
        <Canvas
          camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 1.6, 5] }}
          dpr={[1, 2]} // High DPI support for crisp rendering
          gl={{ 
            antialias: true, // Enable antialiasing for smoother edges
            alpha: false,
            powerPreference: 'high-performance', // Request high-performance GPU
            failIfMajorPerformanceCaveat: false,
            toneMapping: THREE.ACESFilmicToneMapping, // Better color reproduction
            toneMappingExposure: 1.2,
            outputColorSpace: THREE.SRGBColorSpace, // Accurate color space
            shadowMapType: THREE.PCFSoftShadowMap // Softer, higher quality shadows
          }}
          shadows="soft" // Enable soft shadows
          onCreated={handleCreated}
          onError={handleError}
        >
          <Suspense fallback={null}>
            {/* Player tracking component */}
            <PlayerTracker 
              onPositionUpdate={setPlayerPosition}
              onFpsUpdate={setFps}
            />

            {/* Lighting setup for São Paulo atmosphere */}
            <ambientLight intensity={0.3} color="#F0F8FF" />
            <directionalLight
              position={[100, 100, 50]}
              intensity={1.2}
              castShadow
              shadow-mapSize={[4096, 4096]}
              shadow-camera-near={1}
              shadow-camera-far={500}
              shadow-camera-left={-100}
              shadow-camera-right={100}
              shadow-camera-top={100}
              shadow-camera-bottom={-100}
              color="#FFF8DC"
            />
            
            {/* Additional fill lighting for better visual depth */}
            <pointLight position={[-50, 30, 0]} intensity={0.4} color="#FFE4B5" distance={80} />
            <pointLight position={[50, 25, 0]} intensity={0.3} color="#E0FFFF" distance={70} />
            <hemisphereLight args={["#87CEEB", "#8B4513", 0.2]} />
            
            {/* São Paulo sky */}
            <Sky
              distance={450000}
              sunPosition={[100, 20, 100]}
              inclination={0}
              azimuth={0.25}
            />

            {/* Physics world for collision detection */}
            <Physics gravity={[0, -30, 0]} iterations={15} tolerance={0.0001}>
              <Player />
              <Environment />
              <NPCManager />
            </Physics>

            {/* Development stats */}
            {process.env.NODE_ENV === 'development' && <Stats />}
          </Suspense>
        </Canvas>
      </KeyboardControls>

      {/* Game UI Layer */}
      <GameHUD playerPosition={playerPosition} fps={fps} />
      <GameAudio />
    </div>
  )
}