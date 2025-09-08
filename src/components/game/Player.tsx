import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'
import * as THREE from 'three'

type Controls = 'forward' | 'backward' | 'leftward' | 'rightward' | 'sprint' | 'jump'

export const Player = () => {
  const { camera, gl } = useThree()
  const [, get] = useKeyboardControls<Controls>()
  
  const vel = useRef([0, 0, 0])
  
  // Mouse controls for first-person look
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), [])
  const mouseRef = useRef({ x: 0, y: 0 })

  // Player physics body using sphere
  const [ref, api] = useSphere(() => ({
    mass: 1,
    args: [0.5],
    position: [0, 2, 0],
    type: 'Dynamic',
  }))

  // Subscribe to velocity updates
  api.velocity.subscribe((v) => (vel.current = v))
  const dir = new THREE.Vector3()

  // Setup mouse controls
  useEffect(() => {
    const canvas = gl.domElement
    
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        const sensitivity = 0.002
        mouseRef.current.x -= event.movementX * sensitivity
        mouseRef.current.y -= event.movementY * sensitivity
        mouseRef.current.y = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseRef.current.y))
      }
    }

    const onMouseDown = () => {
      canvas.requestPointerLock()
    }

    canvas.addEventListener('click', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)

    return () => {
      canvas.removeEventListener('click', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [gl.domElement])

  useFrame(() => {
    const controls = get()
    const { forward, backward, leftward, rightward, sprint, jump } = controls

    // Update camera rotation from mouse
    euler.setFromQuaternion(camera.quaternion)
    euler.y = mouseRef.current.x
    euler.x = mouseRef.current.y
    camera.quaternion.setFromEuler(euler)

    // Movement direction
    dir.set(
      (leftward ? -1 : 0) + (rightward ? 1 : 0),
      0,
      (forward ? -1 : 0) + (backward ? 1 : 0)
    )

    // Apply movement speed and rotation
    if (dir.lengthSq() > 0) {
      dir.normalize().multiplyScalar(sprint ? 8 : 4).applyEuler(euler)
    }

    const vy = vel.current[1]
    api.velocity.set(dir.x, vy, dir.z)

    // Jumping
    if (jump && Math.abs(vy) < 0.05) {
      api.velocity.set(dir.x, 6, dir.z)
    }

    // Update camera position to follow player
    if (ref.current && 'position' in ref.current) {
      const pos = (ref.current as any).position
      const [x, y, z] = Array.isArray(pos) ? pos : [pos.x, pos.y, pos.z]
      camera.position.set(x, y + 0.6, z) // Eye height offset
    }
  })

  return (
    <mesh ref={ref as any} visible={false}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="white" transparent opacity={0} />
    </mesh>
  )
}