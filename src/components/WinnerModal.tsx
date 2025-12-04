import { memo, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, Gift, Star } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Winner } from '../types'
import { useSounds } from '@/hooks/useSounds'

interface WinnerModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    winner: Winner | null
    onNextPrize: () => void
    isMuted?: boolean
}

// Datos estáticos para estrellas (pre-calculados)
const STAR_POSITIONS = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    top: `${(i * 10) % 100}%`,
    left: `${(i * 12 + 5) % 100}%`,
    delay: i * 0.2,
    scale: 0.5 + (i % 3) * 0.2,
}))

// Componente de estrellas memoizado con CSS puro
const AnimatedStars = memo(() => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {STAR_POSITIONS.map((star) => (
            <div
                key={star.id}
                className="absolute text-yellow-200/50 animate-winner-star"
                style={{
                    top: star.top,
                    left: star.left,
                    transform: `scale(${star.scale})`,
                    animationDelay: `${star.delay}s`,
                }}
            >
                <Star className="h-4 w-4" />
            </div>
        ))}
        <style>{`
            @keyframes winner-star {
                0%, 100% { 
                    transform: translateY(0) rotate(0deg); 
                    opacity: 0.3; 
                }
                50% { 
                    transform: translateY(-20px) rotate(180deg); 
                    opacity: 0.8; 
                }
            }
            .animate-winner-star {
                animation: winner-star 6s ease-in-out infinite;
            }
        `}</style>
    </div>
))
AnimatedStars.displayName = 'AnimatedStars'

export const WinnerModal = memo(function WinnerModal({ 
    isOpen, 
    onOpenChange, 
    winner, 
    onNextPrize,
    isMuted = false
}: WinnerModalProps) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const { playFanfare } = useSounds(isMuted)

    useEffect(() => {
        if (isOpen && winner) {
            // Reproducir fanfarria de victoria
            playFanfare()
            
            const duration = 4 * 1000
            const animationEnd = Date.now() + duration
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

            intervalRef.current = setInterval(() => {
                const timeLeft = animationEnd - Date.now()

                if (timeLeft <= 0) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current)
                        intervalRef.current = null
                    }
                    return
                }

                const particleCount = 30 * (timeLeft / duration)
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() - 0.2 }
                })
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() - 0.2 }
                })
            }, 300)

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = null
                }
            }
        }
    }, [isOpen, winner, playFanfare])

    // Memoizar datos del ganador para evitar recálculos
    const winnerDisplay = useMemo(() => {
        if (!winner) return null
        return {
            name: winner.participant_name,
            ticket: winner.ticket_number,
            prize: winner.prize_name,
        }
    }, [winner])

    if (!winner || !winnerDisplay) {
        return null
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-transparent border-none p-0 overflow-visible max-w-[95vw] sm:max-w-2xl z-[100]">
                <DialogTitle className="sr-only">Ganador del Sorteo</DialogTitle>
                <DialogDescription className="sr-only">
                    {winnerDisplay.name} ha ganado {winnerDisplay.prize}
                </DialogDescription>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative z-[101]"
                >
                    {/* Formas de fondo simplificadas */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-[30px] sm:rounded-[60px] transform rotate-3 scale-105 blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-tl from-emerald-400 via-teal-400 to-cyan-500 rounded-[35px] sm:rounded-[70px] transform -rotate-2" />

                    {/* Contenido principal */}
                    <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-[25px] sm:rounded-[50px] p-4 sm:p-8 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center relative"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: 360 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="mb-4 sm:mb-6 relative z-10"
                            >
                                <Trophy className="w-20 h-20 sm:w-32 sm:h-32 text-yellow-300" />
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-center text-white relative z-10"
                            >
                                <h2 className="mb-4 sm:mb-6">
                                    <span className="text-4xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-yellow-300 to-green-400 bg-clip-text text-transparent block mb-2">
                                        ALOHA
                                    </span>
                                    <span className="text-2xl sm:text-4xl md:text-5xl font-bold text-white block">¡Tenemos un Ganador!</span>
                                </h2>
                                <div className="bg-white/20 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6">
                                    <h3 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">{winnerDisplay.name}</h3>
                                    <p className="text-lg sm:text-2xl mb-2 sm:mb-3">Número: {winnerDisplay.ticket}</p>
                                    <p className="text-xl sm:text-3xl font-semibold">Premio: {winnerDisplay.prize}</p>
                                </div>
                            </motion.div>

                            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:space-x-4 mt-4 sm:mt-6 relative z-10 w-full px-4 sm:px-0">
                                <Button
                                    onClick={() => onOpenChange(false)}
                                    className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105"
                                >
                                    <Star className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    Cerrar
                                </Button>
                                <Button
                                    onClick={onNextPrize}
                                    className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105"
                                >
                                    <Gift className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    Siguiente Premio
                                </Button>
                            </div>

                            <AnimatedStars />
                        </motion.div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    )
})
