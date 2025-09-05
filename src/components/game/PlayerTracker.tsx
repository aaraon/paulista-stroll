import { useFrame, useThree } from '@react-three/fiber'
import { useState } from 'react'
import * as THREE from 'three'

interface PlayerTrackerProps {
  onPositionUpdate: (position: THREE.Vector3) => void
  onFpsUpdate: (fps: number) => void
}

export const PlayerTracker = ({ onPositionUpdate, onFpsUpdate }: PlayerTrackerProps) => {
  const { camera } = useThree()

  useFrame((state) => {
    // Update player position
    onPositionUpdate(camera.position.clone())
    
    // Update FPS
    const fps = Math.round(1 / state.clock.getDelta())
    onFpsUpdate(fps)
  })

  return null // This component doesn't render anything
}