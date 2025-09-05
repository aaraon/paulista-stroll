import { useState, useEffect } from 'react'
import * as THREE from 'three'

const MiniMap = ({ playerPosition }: { playerPosition: THREE.Vector3 }) => {
  const mapScale = 0.5 // Scale factor for the minimap
  
  return (
    <div className="minimap">
      <div className="text-xs font-bold mb-2 text-center">Avenida Paulista</div>
      
      {/* Map background */}
      <div className="relative w-full h-full bg-muted rounded-md overflow-hidden">
        {/* Streets */}
        <div 
          className="absolute bg-secondary"
          style={{
            left: '10%',
            top: '45%',
            width: '80%',
            height: '10%',
          }}
        />
        
        {/* Buildings */}
        <div 
          className="absolute bg-primary/60"
          style={{
            left: '20%',
            top: '20%',
            width: '15%',
            height: '8%',
          }}
        />
        <div 
          className="absolute bg-primary/60"
          style={{
            left: '60%',
            top: '25%',
            width: '12%',
            height: '15%',
          }}
        />
        
        {/* Player dot */}
        <div 
          className="absolute w-2 h-2 bg-accent rounded-full transform -translate-x-1 -translate-y-1"
          style={{
            left: `${50 + playerPosition.x * mapScale}%`,
            top: `${50 - playerPosition.z * mapScale}%`,
          }}
        />
        
        {/* Player direction indicator */}
        <div 
          className="absolute w-3 h-0.5 bg-accent"
          style={{
            left: `${50 + playerPosition.x * mapScale}%`,
            top: `${50 - playerPosition.z * mapScale}%`,
            transformOrigin: 'left center',
          }}
        />
      </div>
    </div>
  )
}

const Crosshair = () => (
  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
    <div className="w-4 h-4 border-2 border-primary/60 rounded-full bg-primary/20"></div>
  </div>
)

const Instructions = ({ show }: { show: boolean }) => {
  if (!show) return null
  
  return (
    <div className="fixed top-4 left-4 hud-element max-w-xs">
      <h3 className="font-bold text-sm mb-2">Bem-vindo à Avenida Paulista!</h3>
      <div className="text-xs space-y-1 text-muted-foreground">
        <p><strong>WASD</strong> - Mover</p>
        <p><strong>Mouse</strong> - Olhar</p>
        <p><strong>Shift</strong> - Correr</p>
        <p><strong>Clique</strong> - Capturar mouse</p>
      </div>
    </div>
  )
}

const LocationDisplay = ({ playerPosition }: { playerPosition: THREE.Vector3 }) => {
  const getLocationName = (pos: THREE.Vector3) => {
    // Determine location based on position
    if (pos.x > -30 && pos.x < -10 && pos.z > -35 && pos.z < -25) {
      return "MASP - Museu de Arte"
    } else if (pos.x > 10 && pos.x < 20 && pos.z > -30 && pos.z < -15) {
      return "Edifício Copacabana"
    } else if (pos.x > 25 && pos.x < 35 && pos.z > -15 && pos.z < 0) {
      return "Centro Empresarial"
    } else if (pos.x > -40 && pos.x < -20 && pos.z > 5 && pos.z < 20) {
      return "Shopping Paulista"
    } else if (Math.abs(pos.z) < 6) {
      return "Avenida Paulista"
    }
    return "São Paulo, SP"
  }

  return (
    <div className="fixed top-4 right-4 hud-element">
      <div className="text-sm font-medium">{getLocationName(playerPosition)}</div>
      <div className="text-xs text-muted-foreground">
        São Paulo, Brasil
      </div>
    </div>
  )
}

const PerformanceStats = ({ fps }: { fps: number }) => {
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <div className="fixed bottom-4 left-4 hud-element text-xs">
      <div>FPS: {fps}</div>
    </div>
  )
}

interface GameHUDProps {
  playerPosition: THREE.Vector3
  fps: number
}

export const GameHUD = ({ playerPosition, fps }: GameHUDProps) => {
  const [showInstructions, setShowInstructions] = useState(true)

  // Hide instructions after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 10000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="game-hud">
      <Crosshair />
      <Instructions show={showInstructions} />
      <LocationDisplay playerPosition={playerPosition} />
      <MiniMap playerPosition={playerPosition} />
      <PerformanceStats fps={fps} />
    </div>
  )
}