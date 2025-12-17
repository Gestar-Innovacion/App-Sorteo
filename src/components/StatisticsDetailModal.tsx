import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Prize, Participant } from '../types'
import { Gift, User, CheckCircle, XCircle, Trophy } from 'lucide-react'

interface StatisticsDetailModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    title: string
    items: (Prize | Participant)[]
    type: 'prizes' | 'participants'
    winners?: Array<{ id_participant: number }>
}

export function StatisticsDetailModal({ isOpen, onOpenChange, title, items, type, winners = [] }: StatisticsDetailModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog open={isOpen} onOpenChange={onOpenChange}>
                    <DialogContent className="sm:max-w-[700px] w-[95vw] max-w-[95vw] sm:w-full bg-gradient-to-br from-teal-700 to-blue-900 text-white rounded-3xl border-2 border-white/20 shadow-xl overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-bold text-center text-white mb-6">{title}</DialogTitle>
                        </DialogHeader>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="max-h-[60vh] overflow-y-auto pr-2"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {items.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <Card className="bg-white/10 border-white/20 overflow-hidden rounded-2xl h-full">
                                            <CardContent className="p-4">
                                                {type === 'prizes' ? (
                                                    <PrizeCard prize={item as Prize} />
                                                ) : (
                                                    <ParticipantCard 
                                                        participant={item as Participant} 
                                                        modalTitle={title}
                                                        winners={winners}
                                                    />
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    )
}

function PrizeCard({ prize }: { prize: Prize }) {
    return (
        <div className="flex flex-col h-full justify-between space-y-2">
            <div className="flex items-center space-x-2 mb-2">
                <Gift className="h-5 w-5 text-purple-300" />
                <h3 className="text-lg font-semibold text-white truncate">{prize.name}</h3>
            </div>
            <p className="text-sm text-white/80">Rango: {prize.range_start.toString().padStart(3, '0')} - {prize.range_end.toString().padStart(3, '0')}</p>
            <div className="mt-2">
                <span className={`px-2 py-1 rounded-full text-xs ${prize.sorteado ? 'bg-yellow-500 text-yellow-900' : 'bg-green-500 text-green-900'}`}>
                    {prize.sorteado ? 'Sorteado' : 'Disponible'}
                </span>
            </div>
        </div>
    )
}

function ParticipantCard({ participant, modalTitle, winners = [] }: { participant: Participant; modalTitle?: string; winners?: Array<{ id_participant: number }> }) {
    const getStatusInfo = () => {
        // Verificar si el participante es realmente un ganador (está en la API de ganadores)
        const isActualWinner = winners.some(w => w.id_participant === participant.id_participant)
        
        // Si estamos en el modal de "No Asistentes", siempre mostrar "No Asistente"
        if (modalTitle?.includes('No Asistentes')) {
            return { label: 'No Asistente', color: 'bg-red-500 text-white', icon: XCircle }
        }
        
        // Si estamos en el modal de "Ganadores", mostrar "Ganador"
        if (modalTitle?.includes('Ganadores')) {
            return { label: 'Ganador', color: 'bg-yellow-500 text-yellow-900', icon: Trophy }
        }
        
        // Lógica simple para todos los casos:
        // Si NO tiene número de manilla → "No Asistente"
        if (!participant.ticket_number) {
            return { label: 'No Asistente', color: 'bg-red-500 text-white', icon: XCircle }
        }
        
        // Si tiene número de manilla Y ganó → "Ganador"
        if (participant.ticket_number && isActualWinner) {
            return { label: 'Ganador', color: 'bg-yellow-500 text-yellow-900', icon: Trophy }
        }
        
        // Si tiene número de manilla → "Asistente"
        if (participant.ticket_number) {
            return { label: 'Asistente', color: 'bg-green-500 text-white', icon: CheckCircle }
        }
        
        // Por defecto
        return { label: 'No Asistente', color: 'bg-red-500 text-white', icon: XCircle }
    }

    const statusInfo = getStatusInfo()
    const StatusIcon = statusInfo.icon

    return (
        <div className="flex flex-col h-full justify-between space-y-2">
            <div className="flex items-center space-x-2 mb-2">
                <User className="h-5 w-5 text-blue-300" />
                <h3 className="text-lg font-semibold text-white truncate">{participant.name}</h3>
            </div>
            <p className="text-sm text-white/80">Cédula: {participant.cedula}</p>
            {participant.ticket_number && (
                <div className="bg-cyan-500/10 border border-cyan-400/25 rounded-xl p-2 mt-2">
                    <p className="text-xs text-white/70 font-medium">Número de Manilla</p>
                    <p className="text-sm font-semibold text-cyan-200">{participant.ticket_number}</p>
                </div>
            )}
            {participant.mesa && (
                <div className="bg-teal-500/10 border border-teal-400/25 rounded-xl p-2 mt-2">
                    <p className="text-xs text-white/70 font-medium">Mesa</p>
                    <p className="text-sm font-semibold text-teal-200">{participant.mesa}</p>
                </div>
            )}
            <div className="mt-2">
                <span className={`px-2 py-1 rounded-full text-xs flex items-center ${statusInfo.color}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                </span>
            </div>
        </div>
    )
}

