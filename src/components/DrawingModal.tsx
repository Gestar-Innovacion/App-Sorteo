import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import confetti from 'canvas-confetti'
import { useEffect, useState } from 'react'
import { Gift, Star, Sparkles, Zap } from 'lucide-react'

interface DrawingModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    winningNumber?: number // Número ganador para la revelación final
    rangeStart?: number // Rango inicial del premio
    rangeEnd?: number // Rango final del premio
}

export function DrawingModal({ isOpen, onOpenChange, winningNumber, rangeStart = 0, rangeEnd = 999 }: DrawingModalProps) {
    const [currentNumber, setCurrentNumber] = useState(0)
    const [isRevealing, setIsRevealing] = useState(false)
    const [finalNumber, setFinalNumber] = useState<number | null>(null)

    useEffect(() => {
        if (isOpen) {
            setIsRevealing(false)
            setFinalNumber(null)
            // Iniciar con un número aleatorio dentro del rango del premio
            const initialNumber = Math.floor(Math.random() * (rangeEnd - rangeStart + 1)) + rangeStart
            setCurrentNumber(initialNumber)
            
            let confettiCount = 0
            const maxConfettiShots = 6
            
            // Animación progresiva: empieza rápido y se va haciendo más lento
            let iteration = 0
            const maxIterations = 35 // Total de cambios de número (reducido de 50 a 35)
            let currentAnimNumber = initialNumber // Variable local para rastrear el número actual
            
            // Array para guardar todos los timeouts y poder limpiarlos
            const timeouts: NodeJS.Timeout[] = []
            
            const animateNumber = () => {
                iteration++
                
                // Calcular velocidad progresiva (exponencial)
                // Empieza en 40ms y termina en ~500ms (más rápido)
                const progress = iteration / maxIterations
                const speed = 40 + (progress * progress * 460) // Curva exponencial más rápida
                
                // Si estamos cerca del final y tenemos el número ganador, preparar la revelación
                if (iteration >= maxIterations - 5 && winningNumber !== undefined) {
                    // Mostrar números cercanos al ganador para crear suspenso
                    // Reducir el rango de búsqueda gradualmente
                    const remainingIterations = maxIterations - iteration
                    const searchRange = Math.max(1, remainingIterations * 2) // Rango que se reduce
                    const randomOffset = Math.floor(Math.random() * searchRange * 2) - searchRange
                    const candidateNumber = (winningNumber || 0) + randomOffset
                    // Asegurar que esté dentro del rango del premio
                    currentAnimNumber = Math.max(rangeStart, Math.min(rangeEnd, candidateNumber))
                    setCurrentNumber(currentAnimNumber)
                } else if (winningNumber !== undefined && iteration > maxIterations * 0.3) {
                    // Después del 30% de la animación, empezar a acercarse al número ganador
                    const distanceToWinner = Math.abs(currentAnimNumber - winningNumber)
                    
                    // Calcular un número que esté más cerca del ganador
                    // El paso se hace más pequeño a medida que nos acercamos
                    const stepSize = Math.max(1, Math.floor(distanceToWinner * (0.2 + (1 - progress) * 0.3)))
                    const direction = winningNumber > currentAnimNumber ? 1 : -1
                    currentAnimNumber = currentAnimNumber + (direction * stepSize)
                    
                    // Asegurar que esté dentro del rango
                    currentAnimNumber = Math.max(rangeStart, Math.min(rangeEnd, currentAnimNumber))
                    setCurrentNumber(currentAnimNumber)
                } else {
                    // Al inicio, mostrar números aleatorios dentro del rango del premio
                    currentAnimNumber = Math.floor(Math.random() * (rangeEnd - rangeStart + 1)) + rangeStart
                    setCurrentNumber(currentAnimNumber)
                }
                
                // Al final, revelar el número ganador
                if (iteration >= maxIterations) {
                    setIsRevealing(true)
                    if (winningNumber !== undefined) {
                        setFinalNumber(winningNumber)
                        setCurrentNumber(winningNumber)
                        
                        // Explosión final de confeti
                        const confettiTimeout = setTimeout(() => {
                            confetti({
                                particleCount: 200,
                                spread: 100,
                                origin: { y: 0.5 },
                                colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#FFA500']
                            })
                        }, 300)
                        timeouts.push(confettiTimeout)
                    }
                } else {
                    // Continuar con la siguiente iteración usando la velocidad calculada
                    const nextTimeout = setTimeout(animateNumber, speed)
                    timeouts.push(nextTimeout)
                }
            }
            
            // Esperar a que el modal se renderice completamente antes de iniciar la animación
            const initDelay = setTimeout(() => {
                // Iniciar la animación después de que el modal esté listo
                const initialTimeout = setTimeout(animateNumber, 50)
                timeouts.push(initialTimeout)

                // Confeti suave durante la animación
                const confettiInterval = setInterval(() => {
                    if (confettiCount < maxConfettiShots && !isRevealing) {
                        confetti({
                            particleCount: 25,
                            spread: 60,
                            origin: { 
                                x: Math.random() * 0.5 + 0.25, 
                                y: Math.random() * 0.3 + 0.2 
                            },
                            colors: ['#FFD700', '#FF6B6B', '#4ECDC4']
                        })
                        confettiCount++
                    } else {
                        clearInterval(confettiInterval)
                    }
                }, 500)
                
                // Guardar el intervalo para limpiarlo
                const intervalId = confettiInterval as unknown as NodeJS.Timeout
                timeouts.push(intervalId)
            }, 300) // Esperar 300ms para que el modal se renderice completamente
            
            timeouts.push(initDelay)

            return () => {
                // Limpiar todos los timeouts
                timeouts.forEach(timeout => clearTimeout(timeout))
            }
        }
    }, [isOpen, winningNumber, rangeStart, rangeEnd]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-transparent border-none p-0 overflow-visible max-w-3xl">
                <DialogTitle className="sr-only">Sorteando</DialogTitle>
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-[4rem] p-12 overflow-hidden shadow-2xl"
                >
                    {/* Efecto de brillo animado */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                            x: ['-100%', '200%'],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                    
                    {/* Fondo con partículas */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full"
                                style={{
                                    width: Math.random() * 20 + 10,
                                    height: Math.random() * 20 + 10,
                                    background: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`,
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    y: [0, -30, 0],
                                    x: [0, Math.random() * 20 - 10, 0],
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.8, 0.3],
                                }}
                                transition={{
                                    duration: Math.random() * 2 + 1,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: Math.random() * 2,
                                }}
                            />
                        ))}
                    </div>

                    <motion.div
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="text-center relative z-10"
                    >
                        <motion.div
                            animate={{ 
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                                duration: 2, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="inline-block mb-6"
                        >
                            <Gift className="w-24 h-24 mx-auto text-yellow-300 drop-shadow-2xl" />
                        </motion.div>
                        
                        <motion.h2 
                            className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 drop-shadow-lg"
                            animate={{
                                textShadow: [
                                    "0 0 20px rgba(64,224,208,0.8), 0 0 40px rgba(255,127,80,0.6), 0 0 60px rgba(255,215,0,0.8)",
                                    "0 0 30px rgba(64,224,208,1), 0 0 50px rgba(255,127,80,0.8), 0 0 70px rgba(255,215,0,1)",
                                    "0 0 20px rgba(64,224,208,0.8), 0 0 40px rgba(255,127,80,0.6), 0 0 60px rgba(255,215,0,0.8)"
                                ]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <span className="bg-gradient-to-r from-cyan-400 via-coral-400 via-yellow-300 to-green-400 bg-clip-text text-transparent animate-pulse">
                                ALOHA
                            </span>
                            <br />
                            <span className="text-white text-4xl md:text-5xl">SORTEANDO</span>
                        </motion.h2>
                    </motion.div>

                    {/* Número grande con efectos */}
                    <motion.div
                        className="relative z-10 mb-8"
                    >
                        <motion.div
                            key={isRevealing ? 'final' : currentNumber}
                            initial={isRevealing ? { 
                                scale: 0.5, 
                                y: -100, 
                                opacity: 0,
                                rotate: -360
                            } : { 
                                scale: 0.8, 
                                opacity: 0.7 
                            }}
                            animate={isRevealing ? { 
                                scale: [0.5, 1.2, 1],
                                y: [0, 0, 0],
                                rotate: [0, 0, 0],
                                opacity: 1,
                            } : { 
                                scale: [0.9, 1.05, 0.9],
                                opacity: [0.7, 1, 0.7]
                            }}
                            transition={isRevealing ? {
                                duration: 0.8,
                                type: "spring",
                                stiffness: 200,
                                damping: 15
                            } : {
                                duration: 0.2,
                                ease: "easeInOut"
                            }}
                            className="relative"
                        >
                            {/* Efecto de resplandor alrededor del número */}
                            <motion.div
                                className="absolute inset-0 blur-2xl"
                                animate={isRevealing ? {
                                    scale: [1, 1.5, 1.2],
                                    opacity: [0.3, 1, 0.8],
                                } : {
                                    scale: [1, 1.2, 1],
                                    opacity: [0.4, 0.7, 0.4],
                                }}
                                transition={{
                                    duration: isRevealing ? 0.8 : 0.5,
                                    repeat: isRevealing ? 0 : Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <div className={`text-9xl font-bold text-center ${isRevealing ? 'text-yellow-300' : 'text-yellow-300/50'}`}>
                                    {(finalNumber ?? currentNumber).toString().padStart(3, '0')}
                                </div>
                            </motion.div>
                            
                            {/* Número principal */}
                            <motion.div 
                                className={`text-9xl md:text-[12rem] font-black text-center drop-shadow-2xl relative z-10 font-mono ${isRevealing ? 'text-yellow-300' : 'text-white'}`}
                                animate={isRevealing ? {
                                    textShadow: [
                                        "0 0 20px rgba(255,215,0,0.8)",
                                        "0 0 60px rgba(255,215,0,1)",
                                        "0 0 40px rgba(255,215,0,0.9)"
                                    ]
                                } : {}}
                                transition={isRevealing ? {
                                    duration: 0.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                } : {}}
                            >
                                {(finalNumber ?? currentNumber).toString().padStart(3, '0')}
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Texto animado */}
                    <motion.div
                        className="relative z-10"
                    >
                        <motion.p
                            animate={isRevealing ? {
                                opacity: [0, 1],
                                scale: [0.8, 1.1, 1]
                            } : {
                                opacity: [0.6, 1, 0.6],
                                scale: [1, 1.05, 1]
                            }}
                            transition={isRevealing ? {
                                duration: 0.5,
                                ease: "easeOut"
                            } : {
                                duration: 1.2, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className={`text-3xl md:text-4xl text-center font-bold drop-shadow-lg flex items-center justify-center gap-3 ${isRevealing ? 'text-yellow-300' : 'text-yellow-200'}`}
                        >
                            {isRevealing ? (
                                <>
                                    <Zap className="w-8 h-8 animate-pulse" />
                                    <span>¡GANADOR SELECCIONADO!</span>
                                    <Zap className="w-8 h-8 animate-pulse" />
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-8 h-8 animate-spin" />
                                    <span>Aloha! Seleccionando ganador...</span>
                                </>
                            )}
                        </motion.p>
                    </motion.div>

                    {/* Estrellas flotantes mejoradas */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute"
                                initial={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    scale: Math.random() * 0.8 + 0.4,
                                    opacity: 0.7,
                                }}
                                animate={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    rotate: 360,
                                    scale: [0.5, 1, 0.5],
                                    opacity: [0.3, 1, 0.3],
                                }}
                                transition={{
                                    duration: Math.random() * 3 + 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                    delay: Math.random() * 2,
                                }}
                            >
                                <Star className="text-yellow-300 w-5 h-5 drop-shadow-lg" fill="currentColor" />
                            </motion.div>
                        ))}
                    </div>

                    {/* Bordes brillantes */}
                    <motion.div
                        className="absolute inset-0 border-4 border-yellow-300/50 rounded-[4rem]"
                        animate={{
                            boxShadow: [
                                "0 0 20px rgba(255,215,0,0.5)",
                                "0 0 40px rgba(255,215,0,0.8)",
                                "0 0 20px rgba(255,215,0,0.5)"
                            ]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>
            </DialogContent>
        </Dialog>
    )
}
