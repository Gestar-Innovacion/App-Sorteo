import { useState, useMemo, useCallback, memo, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Star, AlertCircle } from 'lucide-react'
import { Prize, Participant } from '../types'
import { useToast } from '@/hooks/use-toast'
import '@/styles/fonts.css'

interface DrawSectionProps {
    prizes: Prize[]
    participants: Participant[]
    onSelectPrize: (prize: Prize) => void
}

// Componente memoizado para las estrellas decorativas (con CSS en lugar de Framer Motion)
const DecorativeStars = memo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
            <div
                key={i}
                className="absolute text-white/10 animate-float-star"
                style={{
                    top: `${20 + i * 15}%`,
                    left: `${10 + i * 20}%`,
                    animationDelay: `${i * 0.5}s`,
                }}
            >
                <Star className="w-6 h-6" />
            </div>
        ))}
        <style>{`
            @keyframes float-star {
                0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
                50% { transform: translateY(-10px) rotate(180deg); opacity: 0.3; }
            }
            .animate-float-star {
                animation: float-star 8s ease-in-out infinite;
            }
        `}</style>
    </div>
))
DecorativeStars.displayName = 'DecorativeStars'

interface PrizeCardProps {
    prize: Prize
    eligibleCount: number
    onSelect: () => void
}

// Componente con forwardRef para que AnimatePresence pueda pasar refs
const PrizeCard = memo(forwardRef<HTMLDivElement, PrizeCardProps>(({ 
    prize, 
    eligibleCount, 
    onSelect 
}, ref) => {
    const isDisabled = eligibleCount === 0 || prize.sorteado

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            layout
        >
            <Card
                className={`relative overflow-hidden bg-white/10 backdrop-blur-md border-white/20 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 ${
                    isDisabled ? 'opacity-50' : ''
                }`}
                onClick={onSelect}
            >
                {isDisabled && (
                    <div className="absolute top-2 right-2 text-yellow-500">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                )}
                <DecorativeStars />
                <CardContent className="p-4 sm:p-6 flex items-center justify-center">
                    <h3 className="text-lg sm:text-xl font-semibold text-white text-center">{prize.name}</h3>
                </CardContent>
            </Card>
        </motion.div>
    )
}))
PrizeCard.displayName = 'PrizeCard'

// Función helper fuera del componente
    const extractTicketNumber = (ticketNumber?: string): number | null => {
        if (!ticketNumber) return null
        const numbers = ticketNumber.replace(/\D/g, '')
        if (numbers === '') return null
        return parseInt(numbers, 10)
    }

export const DrawSection = memo(function DrawSection({ prizes, participants, onSelectPrize }: DrawSectionProps) {
    const [, setSelectedPrize] = useState<Prize | null>(null)
    const { toast } = useToast()

    // Pre-calcular participantes elegibles por rango de premio
    const eligibleParticipantsMap = useMemo(() => {
        const map = new Map<number, number>()
        
        prizes.forEach(prize => {
            const count = participants.filter(p => {
            if (!p.ticket_number) return false
            const ticketNum = extractTicketNumber(p.ticket_number)
            if (ticketNum === null) return false
            return ticketNum >= prize.range_start && ticketNum <= prize.range_end
            }).length
            map.set(prize.id_prize ?? 0, count)
        })
        
        return map
    }, [prizes, participants])

    const handleSelectPrize = useCallback((prize: Prize) => {
        const eligibleCount = eligibleParticipantsMap.get(prize.id_prize ?? 0) || 0

        if (eligibleCount === 0) {
            toast({
                title: "No se puede realizar el sorteo",
                description: `No hay participantes elegibles en el rango ${prize.range_start} - ${prize.range_end} para el premio "${prize.name}".`,
                variant: "destructive",
            })
            return
        }

        setSelectedPrize(prize)
        onSelectPrize(prize)
    }, [eligibleParticipantsMap, onSelectPrize, toast])

    return (
        <div className="space-y-8 -mt-2 md:-mt-3">
            {/* Título Aloha destacado */}
            <div className="text-center pt-2 pb-0 relative">
                <h1 
                    className="text-5xl md:text-7xl lg:text-8xl font-normal block mb-0 relative z-10 animate-gradient-text"
                    style={{
                        fontFamily: "'Dancing Script', cursive",
                        background: 'linear-gradient(90deg, #22d3ee, #fb923c, #fde047, #4ade80)',
                        backgroundSize: '200% 100%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: '1.1',
                        fontWeight: 700,
                        filter: 'drop-shadow(0 0 20px rgba(34,211,238,0.5)) drop-shadow(0 0 40px rgba(251,146,60,0.4))',
                    }}
                >
                    Aloha
                </h1>
            </div>

            <div className="relative mb-8 md:mb-12">
                <h2
                    className="text-3xl md:text-4xl lg:text-5xl font-normal text-center py-2 relative z-10 flex items-center justify-center gap-3"
                    style={{
                        fontFamily: "'Dancing Script', cursive",
                        color: 'white',
                        lineHeight: '1.2',
                        fontWeight: 600,
                        textShadow: '0 0 20px rgba(255,255,255,0.3)',
                    }}
                >
                    <span className="animate-twinkle-star">
                        <Star className="w-6 h-6 md:w-8 md:h-8 text-white/80" fill="currentColor" />
                    </span>
                    Realizar Sorteo
                    <span className="animate-twinkle-star-delay">
                        <Star className="w-6 h-6 md:w-8 md:h-8 text-white/80" fill="currentColor" />
                    </span>
                </h2>
            </div>

            <div className="relative mt-8 md:mt-10 px-2">
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
                    <AnimatePresence mode="popLayout">
                        {prizes.map((prize, index) => (
                            <PrizeCard
                                key={prize.id_prize ?? `prize-${index}`}
                                prize={prize}
                                eligibleCount={eligibleParticipantsMap.get(prize.id_prize ?? 0) || 0}
                                onSelect={() => handleSelectPrize(prize)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
            
            <style>{`
                @keyframes gradient-text {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes twinkle-star {
                    0%, 100% { 
                        opacity: 0.6; 
                        transform: scale(0.9) rotate(0deg); 
                    }
                    50% { 
                        opacity: 1; 
                        transform: scale(1.1) rotate(15deg); 
                    }
                }
                .animate-gradient-text {
                    animation: gradient-text 6s ease infinite;
                }
                .animate-twinkle-star {
                    animation: twinkle-star 2s ease-in-out infinite;
                }
                .animate-twinkle-star-delay {
                    animation: twinkle-star 2s ease-in-out infinite;
                    animation-delay: 1s;
                }
            `}</style>
        </div>
    )
})
