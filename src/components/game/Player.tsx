import { useKeyboardControls } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Vector3 } from 'three'

const SPEED = 7
const JUMP = 6

export const Player = () => {
  const [, get] = useKeyboardControls()
  const vel = useRef([0, 0, 0])

  const [ref, api] = useSphere(() => ({
    mass: 1,
    args: [0.5],
    position: [0, 2, 5],
    type: 'Dynamic',
    linearDamping: 0.15,
    angularDamping: 0.999,
  }))

  api.velocity.subscribe((v) => (vel.current = v))
  const dir = new Vector3()

  useFrame(() => {
    const { forward, backward, left, right, jump } = get()

    dir.set(
      (left ? -1 : 0) + (right ? 1 : 0),
      0,
      (forward ? -1 : 0) + (backward ? 1 : 0)
    )

    if (dir.lengthSq() > 0) dir.normalize().multiplyScalar(SPEED)

    const vy = vel.current[1]
    api.velocity.set(dir.x, vy, dir.z)

    if (jump && Math.abs(vy) < 0.05) {
      api.velocity.set(dir.x, JUMP, dir.z)
    }
  })

  return (
    <mesh ref={ref as any} castShadow>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  )
}