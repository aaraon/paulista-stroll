import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { Sky, Stats, KeyboardControls } from '@react-three/drei'
import { Suspense } from 'react'
import { Player } from './Player'
import { Environment } from './Environment'
import { NPCManager } from './NPCManager'
import { GameHUD } from './GameHUD'
import { GameAudio } from './GameAudio'

const keyMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'sprint', keys: ['ShiftLeft'] },
  { name: 'jump', keys: ['Space'] },
]

export const SaoPauloGame = () => {
  return (
    <div className="w-full h-screen relative">
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 1.6, 5] }}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            {/* Lighting setup for São Paulo atmosphere */}
            <ambientLight intensity={0.4} color="#f0f0f0" />
            <directionalLight
              position={[100, 100, 50]}
              intensity={1}
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-near={1}
              shadow-camera-far={500}
              shadow-camera-left={-100}
              shadow-camera-right={100}
              shadow-camera-top={100}
              shadow-camera-bottom={-100}
            />
            
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
      <GameHUD />
      <GameAudio />
    </div>
  )
}