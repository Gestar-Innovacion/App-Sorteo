import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import confetti from 'canvas-confetti'
import { useEffect, useState, useRef } from 'react'
import { Gift, Star, Sparkles, Zap } from 'lucide-react'
import { useSounds } from '@/hooks/useSounds'

interface DrawingModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    winningNumber?: number
    rangeStart?: number
    rangeEnd?: number
    isMuted?: boolean
}

// Datos estáticos para partículas (pre-calculados)
const PARTICLE_DATA = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    width: 10 + (i % 3) * 5,
    top: `${(i * 12) % 100}%`,
    left: `${(i * 15) % 100}%`,
    delay: i * 0.3,
}))

const STAR_DATA = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    top: `${(i * 16) % 100}%`,
    left: `${(i * 18) % 100}%`,
    delay: i * 0.4,
}))

// Componente de partículas memoizado con CSS
const ModalParticles = memo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLE_DATA.map((p) => (
            <div
                key={p.id}
                className="absolute rounded-full bg-white/30 animate-modal-particle"
                style={{
                    width: p.width,
                    height: p.width,
                    top: p.top,
                    left: p.left,
                    animationDelay: `${p.delay}s`,
                }}
            />
        ))}
        <style>{`
            @keyframes modal-particle {
                0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
                50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
            }
            .animate-modal-particle {
                animation: modal-particle 3s ease-in-out infinite;
            }
        `}</style>
    </div>
))
ModalParticles.displayName = 'ModalParticles'

// Estrellas flotantes con CSS
const FloatingStars = memo(() => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {STAR_DATA.map((s) => (
            <div
                key={s.id}
                className="absolute animate-floating-star"
                style={{
                    top: s.top,
                    left: s.left,
                    animationDelay: `${s.delay}s`,
                }}
            >
                <Star className="text-yellow-300 w-5 h-5 drop-shadow-lg" fill="currentColor" />
            </div>
        ))}
        <style>{`
            @keyframes floating-star {
                0%, 100% { transform: translateY(0) rotate(0deg) scale(0.5); opacity: 0.3; }
                50% { transform: translateY(-15px) rotate(180deg) scale(1); opacity: 1; }
            }
            .animate-floating-star {
                animation: floating-star 4s ease-in-out infinite;
            }
        `}</style>
    </div>
))
FloatingStars.displayName = 'FloatingStars'

export const DrawingModal = memo(function DrawingModal({ 
    isOpen, 
    onOpenChange, 
    winningNumber, 
    rangeStart = 0, 
    rangeEnd = 999,
    isMuted = false
}: DrawingModalProps) {
    const [currentNumber, setCurrentNumber] = useState(0)
    const [isRevealing, setIsRevealing] = useState(false)
    const [finalNumber, setFinalNumber] = useState<number | null>(null)
    const timeoutsRef = useRef<NodeJS.Timeout[]>([])
    const { playDrumroll, stop } = useSounds(isMuted)

    // Limpiar timeouts al desmontar
    useEffect(() => {
        return () => {
            timeoutsRef.current.forEach(t => clearTimeout(t))
            stop('drumroll')
        }
    }, [stop])

    useEffect(() => {
        if (isOpen) {
            // Limpiar timeouts anteriores
            timeoutsRef.current.forEach(t => clearTimeout(t))
            timeoutsRef.current = []
            
            setIsRevealing(false)
            setFinalNumber(null)
            
            // Reproducir sonido de tambores
            playDrumroll()
            
            const initialNumber = Math.floor(Math.random() * (rangeEnd - rangeStart + 1)) + rangeStart
            setCurrentNumber(initialNumber)
            
            let confettiCount = 0
            const maxConfettiShots = 3
            let iteration = 0
            const maxIterations = 20
            
            const animateNumber = () => {
                iteration++
                
                // Velocidad: empieza rápido (60ms) y va más lento al final (250ms)
                const progress = iteration / maxIterations
                const speed = 60 + (progress * progress * 190)
                
                if (iteration >= maxIterations) {
                    // Terminó - mostrar ganador
                    setIsRevealing(true)
                    stop('drumroll')
                    
                    if (winningNumber !== undefined) {
                        setFinalNumber(winningNumber)
                        setCurrentNumber(winningNumber)
                        
                        const confettiTimeout = setTimeout(() => {
                            confetti({
                                particleCount: 150,
                                spread: 80,
                                origin: { y: 0.5 },
                                colors: ['#FFD700', '#FF6B6B', '#4ECDC4']
                            })
                        }, 300)
                        timeoutsRef.current.push(confettiTimeout)
                    }
                } else {
                    // Números aleatorios dentro del rango
                    const randomNumber = Math.floor(Math.random() * (rangeEnd - rangeStart + 1)) + rangeStart
                    setCurrentNumber(randomNumber)
                    
                    const nextTimeout = setTimeout(animateNumber, speed)
                    timeoutsRef.current.push(nextTimeout)
                }
            }
            
            const initDelay = setTimeout(() => {
                const initialTimeout = setTimeout(animateNumber, 50)
                timeoutsRef.current.push(initialTimeout)

                const confettiInterval = setInterval(() => {
                    if (confettiCount < maxConfettiShots) {
                        confetti({
                            particleCount: 20,
                            spread: 50,
                            origin: { x: Math.random() * 0.5 + 0.25, y: Math.random() * 0.3 + 0.2 },
                            colors: ['#FFD700', '#FF6B6B', '#4ECDC4']
                        })
                        confettiCount++
                    } else {
                        clearInterval(confettiInterval)
                    }
                }, 600)
                
                timeoutsRef.current.push(confettiInterval as unknown as NodeJS.Timeout)
            }, 200)
            
            timeoutsRef.current.push(initDelay)

            return () => {
                timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
                timeoutsRef.current = []
                stop('drumroll')
            }
        }
    }, [isOpen, winningNumber, rangeStart, rangeEnd, playDrumroll, stop])

    const displayNumber = useMemo(() => 
        (finalNumber ?? currentNumber).toString().padStart(3, '0'),
        [finalNumber, currentNumber]
    )

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-transparent border-none p-0 overflow-visible max-w-[95vw] sm:max-w-3xl">
                <DialogTitle className="sr-only">Sorteando</DialogTitle>
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 rounded-[2rem] sm:rounded-[4rem] p-6 sm:p-12 overflow-hidden shadow-2xl"
                >
                    {/* Efecto de brillo con CSS */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
                    
                    <ModalParticles />

                    <div className="text-center relative z-10">
                        <div className="inline-block mb-4 sm:mb-6 animate-wiggle">
                            <Gift className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-yellow-300 drop-shadow-2xl" />
                        </div>
                        
                        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-4 sm:mb-8 drop-shadow-lg">
                            <span className="bg-gradient-to-r from-cyan-400 via-yellow-300 to-green-400 bg-clip-text text-transparent">
                                ALOHA
                            </span>
                            <br />
                            <span className="text-white text-2xl sm:text-4xl md:text-5xl">SORTEANDO</span>
                        </h2>
                    </div>

                    {/* Número grande */}
                    <div className="relative z-10 mb-4 sm:mb-8">
                        <motion.div
                            key={isRevealing ? 'final' : currentNumber}
                            initial={isRevealing ? { scale: 0.5, opacity: 0 } : { scale: 0.9, opacity: 0.8 }}
                            animate={isRevealing ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, type: "spring" }}
                            className="relative"
                        >
                            <div 
                                className={`text-6xl sm:text-9xl md:text-[12rem] font-black text-center drop-shadow-2xl font-mono ${
                                    isRevealing ? 'text-yellow-300 animate-glow' : 'text-white'
                                }`}
                            >
                                {displayNumber}
                            </div>
                        </motion.div>
                    </div>

                    {/* Texto de estado */}
                    <div className="relative z-10">
                        <p className={`text-xl sm:text-3xl md:text-4xl text-center font-bold drop-shadow-lg flex items-center justify-center gap-2 sm:gap-3 ${
                            isRevealing ? 'text-yellow-300' : 'text-yellow-200'
                        }`}>
                            {isRevealing ? (
                                <>
                                    <Zap className="w-5 h-5 sm:w-8 sm:h-8" />
                                    <span>¡GANADOR SELECCIONADO!</span>
                                    <Zap className="w-5 h-5 sm:w-8 sm:h-8" />
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 animate-spin" />
                                    <span className="text-sm sm:text-xl md:text-3xl">Aloha! Seleccionando ganador...</span>
                                </>
                            )}
                        </p>
                    </div>

                    <FloatingStars />

                    {/* Borde brillante con CSS */}
                    <div className="absolute inset-0 border-2 sm:border-4 border-cyan-300/50 rounded-[2rem] sm:rounded-[4rem] animate-border-glow" />
                </motion.div>
                
                <style>{`
                    @keyframes shine {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(200%); }
                    }
                    @keyframes wiggle {
                        0%, 100% { transform: rotate(-5deg) scale(1); }
                        50% { transform: rotate(5deg) scale(1.1); }
                    }
                    @keyframes glow {
                        0%, 100% { text-shadow: 0 0 20px rgba(255,215,0,0.8); }
                        50% { text-shadow: 0 0 40px rgba(255,215,0,1), 0 0 60px rgba(255,215,0,0.8); }
                    }
                    @keyframes border-glow {
                        0%, 100% { box-shadow: 0 0 20px rgba(255,215,0,0.5); }
                        50% { box-shadow: 0 0 40px rgba(255,215,0,0.8); }
                    }
                    .animate-shine {
                        animation: shine 2s linear infinite;
                    }
                    .animate-wiggle {
                        animation: wiggle 2s ease-in-out infinite;
                    }
                    .animate-glow {
                        animation: glow 1s ease-in-out infinite;
                    }
                    .animate-border-glow {
                        animation: border-glow 2s ease-in-out infinite;
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    )
})
