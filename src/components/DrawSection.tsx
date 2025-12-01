import { useState } from 'react'
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

export function DrawSection({ prizes, participants, onSelectPrize }: DrawSectionProps) {
    const [, setSelectedPrize] = useState<Prize | null>(null)
    const { toast } = useToast()

    // Función helper para extraer número del ticket
    const extractTicketNumber = (ticketNumber?: string): number | null => {
        if (!ticketNumber) return null
        const numbers = ticketNumber.replace(/\D/g, '')
        if (numbers === '') return null
        return parseInt(numbers, 10)
    }

    const handleSelectPrize = (prize: Prize) => {
        const eligibleParticipants = participants.filter(p => {
            if (!p.active || !p.ticket_number) return false
            const ticketNum = extractTicketNumber(p.ticket_number)
            if (ticketNum === null) return false
            return ticketNum >= prize.range_start && ticketNum <= prize.range_end
        })

        if (eligibleParticipants.length === 0) {
            toast({
                title: "No se puede realizar el sorteo",
                description: `No hay participantes elegibles en el rango ${prize.range_start} - ${prize.range_end} para el premio "${prize.name}".`,
                variant: "destructive",
            })
            return
        }

        setSelectedPrize(prize)
        onSelectPrize(prize)
    }


    return (
        <div className="space-y-8 -mt-2 md:-mt-3">
            {/* Título Aloha destacado */}
            <div className="text-center pt-4 pb-0 relative">
                <h1 
                    className="text-6xl md:text-[8rem] lg:text-[10rem] font-normal block mb-0 relative z-10"
                    style={{
                        fontFamily: "'Dancing Script', cursive",
                        background: 'linear-gradient(90deg, #22d3ee, #fb923c, #fde047, #4ade80)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: '1.1',
                        fontWeight: 700,
                        filter: 'drop-shadow(0 0 30px rgba(34,211,238,0.6)) drop-shadow(0 0 60px rgba(251,146,60,0.5)) drop-shadow(0 0 90px rgba(253,224,71,0.4))',
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
                        filter: 'drop-shadow(0 0 20px rgba(34,211,238,0.5)) drop-shadow(0 0 40px rgba(251,146,60,0.4))',
                        paddingTop: '0.75rem',
                    }}
                >
                    Realizar Sorteo
                </h2>
                <motion.span
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <Star className="text-blue-300 w-16 h-16" />
                </motion.span>
                <motion.span
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <Star className="text-blue-300 w-16 h-16" />
                </motion.span>
            </div>

            <div className="relative mt-12 md:mt-16">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-30 blur-3xl" />
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    <AnimatePresence>
                        {prizes.map((prize) => {
                            const eligibleParticipants = participants.filter(p => {
                                if (!p.active || !p.ticket_number) return false
                                const ticketNum = extractTicketNumber(p.ticket_number)
                                if (ticketNum === null) return false
                                return ticketNum >= prize.range_start && ticketNum <= prize.range_end
                            })
                            
                            return (
                            <motion.div
                                key={prize.id_prize}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Card
                                    className={`relative overflow-hidden bg-white/10 backdrop-blur-md border-white/20 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 ${eligibleParticipants.length === 0 || prize.sorteado
                                        ? 'opacity-50'
                                        : ''
                                        }`}
                                    onClick={() => handleSelectPrize(prize)}
                                >
                                    {(eligibleParticipants.length === 0 || prize.sorteado) && (
                                        <div className="absolute top-2 right-2 text-yellow-500">
                                            <AlertCircle className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 overflow-hidden">
                                        {[...Array(5)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute text-white/10"
                                                initial={{
                                                    top: `${Math.random() * 100}%`,
                                                    left: `${Math.random() * 100}%`,
                                                    scale: Math.random() * 0.5 + 0.5,
                                                }}
                                                animate={{
                                                    top: `${Math.random() * 100}%`,
                                                    left: `${Math.random() * 100}%`,
                                                    scale: Math.random() * 0.5 + 0.5,
                                                    rotate: 360,
                                                }}
                                                transition={{
                                                    duration: Math.random() * 20 + 10,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                            >
                                                <Star className="w-6 h-6" />
                                            </motion.div>
                                        ))}
                                    </div>
                                    <CardContent className="p-6 flex items-center justify-center">
                                        <h3 className="text-xl font-semibold text-white text-center">{prize.name}</h3>
                                    </CardContent>
                                </Card>
                            </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

