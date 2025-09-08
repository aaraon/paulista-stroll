import { Canvas } from '@react-three/fiber'
import { KeyboardControls, PointerLockControls } from '@react-three/drei'
import { Physics } from '@react-three/cannon'
import { Suspense, useEffect } from 'react'
import { Environment } from './components/game/Environment'
import { Player } from './components/game/Player'

const keymap = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'jump', keys: ['Space'] },
]

export default function Game() {
  // Block host page shortcuts that steal focus (Space/Arrows)
  useEffect(() => {
    const block = (e: KeyboardEvent) => {
      const list = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      if (list.includes(e.code)) e.preventDefault()
    }
    window.addEventListener('keydown', block, { passive: false })
    return () => window.removeEventListener('keydown', block as any)
  }, [])

  return (
    <KeyboardControls map={keymap}>
      <Canvas
        shadows
        camera={{ fov: 60, position: [0, 8, 18] }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
          toneMapping: 1, // THREE.ACESFilmicToneMapping
          toneMappingExposure: 1.2,
        }}
        onCreated={({ gl }) => {
          const el = gl.domElement
          el.tabIndex = 0   // allow focus
          el.focus()        // focus once
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 20, 10]} intensity={0.9} castShadow />

          <Physics gravity={[0, -9.81, 0]} allowSleep>
            <Environment />
            <Player />
          </Physics>

          {/* Click once to lock pointer; ESC to release */}
          <PointerLockControls />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  )
}