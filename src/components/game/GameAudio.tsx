import { useEffect, useRef, useState } from 'react'

export const GameAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const [audioEnabled, setAudioEnabled] = useState(false)

  useEffect(() => {
    // Initialize web audio context for ambient sounds
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // Create ambient city soundscape using Web Audio API
        if (audioContextRef.current && audioEnabled) {
          await createAmbientSounds(audioContextRef.current)
        }
      } catch (error) {
        console.log('Audio context not supported or failed to initialize')
      }
    }

    if (audioEnabled) {
      initAudio()
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [audioEnabled])

  const createAmbientSounds = async (audioContext: AudioContext) => {
    // Create traffic noise (low frequency rumble)
    const createTrafficNoise = () => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      const filter = audioContext.createBiquadFilter()
      
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(60, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 10)
      
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(200, audioContext.currentTime)
      
      gainNode.gain.setValueAtTime(0.02, audioContext.currentTime)
      
      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.start()
      
      // Loop the traffic sound
      setTimeout(() => {
        oscillator.stop()
        createTrafficNoise() // Restart
      }, 10000)
    }

    // Create distant urban hum
    const createUrbanHum = () => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(120, audioContext.currentTime)
      
      gainNode.gain.setValueAtTime(0.01, audioContext.currentTime)
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.start()
    }

    // Create occasional bus sounds
    const createBusSound = () => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(100, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 2)
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.5)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 3)
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 3)
      
      // Schedule next bus sound randomly
      setTimeout(() => {
        if (Math.random() < 0.3) createBusSound()
      }, Math.random() * 15000 + 5000) // 5-20 seconds
    }

    createTrafficNoise()
    createUrbanHum()
    
    // Start occasional bus sounds
    setTimeout(() => createBusSound(), Math.random() * 5000 + 2000)
  }

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)
  }

  return (
    <div className="fixed bottom-4 right-52 hud-element">
      <button
        onClick={toggleAudio}
        className="text-xs px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors"
        title={audioEnabled ? 'Desativar áudio ambiente' : 'Ativar áudio ambiente'}
      >
        🔊 {audioEnabled ? 'ON' : 'OFF'}
      </button>
    </div>
  )
}