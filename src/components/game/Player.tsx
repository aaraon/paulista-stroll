import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useBox } from '@react-three/cannon'
import * as THREE from 'three'

type Controls = 'forward' | 'backward' | 'leftward' | 'rightward' | 'sprint' | 'jump'

export const Player = () => {
  const { camera, gl } = useThree()
  const [, get] = useKeyboardControls<Controls>()
  
  const playerRef = useRef<THREE.Group>(null!)
  const velocityRef = useRef({ x: 0, z: 0, y: 0 })
  const isGrounded = useRef(true)
  
  // Mouse controls for first-person look
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), [])
  const mouseRef = useRef({ x: 0, y: 0 })

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

  // Player physics body (simplified box for now)
  const [playerBody] = useBox(() => ({
    mass: 70,
    position: [0, 2, 5],
    args: [0.6, 1.8, 0.6], // width, height, depth
    fixedRotation: true,
    linearDamping: 0.4, // Reduced damping for better movement
    angularDamping: 0.4,
  }))

  useFrame((state, delta) => {
    if (!playerBody.current) return

    const controls = get()
    const forward = controls.forward
    const backward = controls.backward
    const leftward = controls.leftward
    const rightward = controls.rightward
    const sprint = controls.sprint
    const jump = controls.jump

    // Debug logging
    if (forward || backward || leftward || rightward) {
      console.log('Controls:', { forward, backward, leftward, rightward })
    }

    // Update camera rotation from mouse
    euler.setFromQuaternion(camera.quaternion)
    euler.y = mouseRef.current.x
    euler.x = mouseRef.current.y
    camera.quaternion.setFromEuler(euler)

    // Movement calculations
    const direction = new THREE.Vector3()
    const frontVector = new THREE.Vector3(0, 0, Number(forward) - Number(backward))
    const sideVector = new THREE.Vector3(Number(rightward) - Number(leftward), 0, 0)
    
    direction
      .addVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(sprint ? 8 : 4) // Sprint speed vs walk speed
      .applyEuler(euler)

    // Debug the direction vector
    if (forward || backward || leftward || rightward) {
      console.log('Direction vector:', direction)
    }

    // Update velocity
    velocityRef.current.x = direction.x
    velocityRef.current.z = direction.z

    // Jumping (simplified)
    if (jump) {
      velocityRef.current.y = 8
    }

    // Apply movement to physics body with proper API
    if (playerBody.current) {
      console.log('Applying velocity:', velocityRef.current)
      // Use the proper cannon.js API with type casting
      const body = playerBody.current as any
      body.velocity.x = velocityRef.current.x
      body.velocity.z = velocityRef.current.z
      if (jump) {
        body.velocity.y = velocityRef.current.y
      }
    }

    // Update camera position to follow player
    if (playerBody.current && 'position' in playerBody.current) {
      const pos = (playerBody.current as any).position
      const [x, y, z] = Array.isArray(pos) ? pos : [pos.x, pos.y, pos.z]
      camera.position.set(x, y + 0.6, z) // Eye height offset
    }

    // Reset jump velocity after applying
    velocityRef.current.y = 0
  })

  return (
    <group ref={playerRef}>
      {/* Visual debug representation (invisible in game) */}
      <mesh ref={playerBody as any} visible={false}>
        <boxGeometry args={[0.6, 1.8, 0.6]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}