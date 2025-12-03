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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
                <CardContent className="p-6 flex items-center justify-center">
                    <h3 className="text-xl font-semibold text-white text-center">{prize.name}</h3>
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
                if (!p.active || !p.ticket_number) return false
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
            <div className="text-center pt-4 pb-0 relative">
                <h1 
                    className="text-6xl md:text-[8rem] lg:text-[10rem] font-normal block mb-0 relative z-10 animate-gradient-text"
                    style={{
                        fontFamily: "'Dancing Script', cursive",
                        background: 'linear-gradient(90deg, #22d3ee, #fb923c, #fde047, #4ade80)',
                        backgroundSize: '200% 100%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: '1.1',
                        fontWeight: 700,
                        filter: 'drop-shadow(0 0 30px rgba(34,211,238,0.6)) drop-shadow(0 0 60px rgba(251,146,60,0.5))',
                    }}
                >
                    Aloha
                </h1>
            </div>

            <div className="relative mb-16">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-orange-400 to-yellow-400 opacity-30 filter blur-xl rounded-full"></div>
                <h2
                    className="text-4xl md:text-5xl lg:text-6xl font-normal text-center py-3 px-8 relative z-10"
                    style={{
                        fontFamily: "'Dancing Script', cursive",
                        background: 'linear-gradient(90deg, #22d3ee, #fb923c, #fde047, #4ade80)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: '1.2',
                        fontWeight: 700,
                        filter: 'drop-shadow(0 0 20px rgba(34,211,238,0.5))',
                        paddingTop: '0.75rem',
                    }}
                >
                    Realizar Sorteo
                </h2>
                {/* Estrellas con CSS puro en lugar de Framer Motion */}
                <span className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 animate-spin-slow">
                    <Star className="text-blue-300 w-16 h-16" />
                </span>
                <span className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 animate-spin-slow-reverse">
                    <Star className="text-blue-300 w-16 h-16" />
                </span>
            </div>

            <div className="relative mt-12 md:mt-16">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-30 blur-3xl" />
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    <AnimatePresence mode="popLayout">
                        {prizes.map((prize) => (
                            <PrizeCard
                                key={prize.id_prize}
                                prize={prize}
                                eligibleCount={eligibleParticipantsMap.get(prize.id_prize ?? 0) || 0}
                                onSelect={() => handleSelectPrize(prize)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
            
            <style>{`
                @keyframes spin-slow {
                    from { transform: translateY(-50%) translateX(-50%) rotate(0deg); }
                    to { transform: translateY(-50%) translateX(-50%) rotate(360deg); }
                }
                @keyframes spin-slow-reverse {
                    from { transform: translateY(-50%) translateX(50%) rotate(0deg); }
                    to { transform: translateY(-50%) translateX(50%) rotate(-360deg); }
                }
                @keyframes gradient-text {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
                .animate-spin-slow-reverse {
                    animation: spin-slow-reverse 20s linear infinite;
                }
                .animate-gradient-text {
                    animation: gradient-text 6s ease infinite;
                }
            `}</style>
        </div>
    )
})
