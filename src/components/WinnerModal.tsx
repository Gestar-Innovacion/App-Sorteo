import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, Gift, Star } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'
import { Winner } from '../types'

interface WinnerModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    winner: Winner | null
    onNextPrize: () => void
}

export function WinnerModal({ isOpen, onOpenChange, winner, onNextPrize }: WinnerModalProps) {
    useEffect(() => {
        if (isOpen && winner) {
            console.log('WinnerModal: Iniciando confeti, winner:', winner)
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            function randomInRange(min: number, max: number) {
                return Math.random() * (max - min) + min;
            }

            const interval: NodeJS.Timeout = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen, winner]);

    console.log('WinnerModal render - isOpen:', isOpen, 'winner:', winner)

    if (!winner) {
        console.log('WinnerModal: No hay winner, no se renderiza')
        return null
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-transparent border-none p-0 overflow-visible max-w-2xl z-[100]">
                <DialogTitle className="sr-only">Ganador del Sorteo</DialogTitle>
                <DialogDescription className="sr-only">
                    {winner.participant_name} ha ganado {winner.prize_name}
                </DialogDescription>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="relative z-[101]"
                >
                    {/* Forma orgánica de fondo */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-[60px] transform rotate-3 scale-105 blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-tl from-yellow-300 via-orange-400 to-red-400 rounded-[70px] transform -rotate-2" />

                    {/* Contenido principal */}
                    <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-[50px] p-8 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center relative"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: 360 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="mb-6 relative z-10"
                            >
                                <Trophy className="w-32 h-32 text-yellow-200" />
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-center text-white relative z-10"
                            >
                                <h2 className="mb-6">
                                    <span className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-coral-400 via-yellow-300 to-green-400 bg-clip-text text-transparent animate-pulse block mb-2">
                                        ALOHA
                                    </span>
                                    <span className="text-4xl md:text-5xl font-bold text-white block">¡Tenemos un Ganador!</span>
                                </h2>
                                <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 mb-6">
                                    <h3 className="text-4xl font-bold mb-3">{winner.participant_name}</h3>
                                    <p className="text-2xl mb-3">Número: {winner.ticket_number}</p>
                                    <p className="text-3xl font-semibold">Premio: {winner.prize_name}</p>
                                </div>
                            </motion.div>

                            <div className="flex justify-center space-x-4 mt-6 relative z-10">
                                <Button
                                    onClick={() => onOpenChange(false)}
                                    className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 rounded-full px-8 py-6 text-lg font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105"
                                >
                                    <Star className="mr-2 h-5 w-5" />
                                    Cerrar
                                </Button>
                                <Button
                                    onClick={onNextPrize}
                                    className="bg-green-500 hover:bg-green-600 text-white rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
                                >
                                    <Gift className="mr-2 h-5 w-5" />
                                    Siguiente Premio
                                </Button>
                            </div>

                            {/* Estrellas animadas */}
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute text-yellow-200 opacity-50"
                                    initial={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        scale: Math.random() * 0.5 + 0.5,
                                    }}
                                    animate={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        rotate: 360,
                                        scale: Math.random() * 0.5 + 0.5,
                                    }}
                                    transition={{
                                        duration: Math.random() * 20 + 10,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                >
                                    <Star className="h-4 w-4" />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    )
}
