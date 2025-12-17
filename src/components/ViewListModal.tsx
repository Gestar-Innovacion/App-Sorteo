import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Gift, Users, Trash2, Search, CheckCircle, XCircle, User, CreditCard, Ticket, Hash, DollarSign, Trophy, Edit, Table } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Prize, Participant, PrizeOrParticipant } from '../types'

interface ViewListModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    items: PrizeOrParticipant[]
    type: 'prizes' | 'participants'
    onDelete: (id: number) => void
    onEditParticipant?: (participant: Participant) => void
    onEditPrize?: (prize: Prize) => void
    winners?: Array<{ id_participant: number }>
}

export function ViewListModal({ isOpen, onOpenChange, items = [], type, onDelete, onEditParticipant, onEditPrize, winners = [] }: ViewListModalProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredItems, setFilteredItems] = useState<PrizeOrParticipant[]>(items)

    useEffect(() => {
        const filtered = items.filter((item) => {
            // Verificar que item sea un objeto válido
            if (!item || typeof item !== 'object') return false;
            
            if (type === 'prizes' && 'name' in item) {
                const prize = item as Prize;
                return (
                    prize.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    `${prize.range_start}-${prize.range_end}`.includes(searchQuery)
                );
            } else if (type === 'participants' && 'name' in item) {
                const participant = item as Participant;
                return (
                    participant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    participant.cedula?.includes(searchQuery) ||
                    participant.ticket_number?.includes(searchQuery) ||
                    participant.mesa?.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
            return false;
        });
        setFilteredItems(filtered)
    }, [searchQuery, items, type])

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog open={isOpen} onOpenChange={onOpenChange}>
                    <DialogContent className="bg-gradient-to-br from-teal-700 to-blue-900 text-white w-[95vw] max-w-[95vw] sm:max-w-[90vw] rounded-3xl border-2 border-white/20 shadow-xl p-4 sm:p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-center flex items-center justify-center text-white flex-wrap gap-2">
                                {type === 'prizes' ? (
                                    <>
                                        <Gift className="mr-2 h-8 w-8" />
                                        Lista de Premios
                                    </>
                                ) : (
                                    <>
                                        <Users className="mr-2 h-8 w-8" />
                                        Lista de Participantes
                                    </>
                                )}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center space-x-2 mb-4">
                            <Search className="text-white/60 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                            <Input
                                type="text"
                                placeholder={type === 'prizes' ? "Buscar..." : "Buscar..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-grow bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl text-sm sm:text-base py-2 sm:py-3"
                            />
                        </div>
                        <ScrollArea className="h-[60vh] sm:h-[70vh] rounded-md">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-2 sm:p-4"
                            >
                                {filteredItems.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <Card className="bg-white/10 border-white/20 overflow-hidden rounded-2xl sm:rounded-3xl h-auto">
                                            <CardContent className="p-3 sm:p-4 h-full">
                                                {type === 'prizes' ? (
                                                    <PrizeItem
                                                        prize={item as Prize}
                                                        onDelete={onDelete}
                                                        onEdit={onEditPrize}
                                                    />
                                                ) : (
                                                    <ParticipantItem
                                                        participant={item as Participant}
                                                        onDelete={onDelete}
                                                        onEdit={onEditParticipant}
                                                        winners={winners}
                                                    />
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    )
}

function PrizeItem({ prize, onDelete, onEdit }: { prize: Prize; onDelete: (id: number) => void; onEdit?: (prize: Prize) => void }) {
    return (
        <div className="flex flex-col h-full justify-between space-y-2">
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-purple-300 flex-shrink-0" />
                    <h3 className="text-base sm:text-lg font-semibold text-white truncate">{prize.name || 'Unnamed Prize'}</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-blue-300 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-white/80 break-words">Rango: {prize.range_start.toString().padStart(3, '0')} - {prize.range_end.toString().padStart(3, '0')}</p>
                </div>
            </div>
            <div className="flex justify-between space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs flex items-center flex-1 justify-center ${prize.sorteado ? 'bg-yellow-500 text-yellow-900' : 'bg-green-500 text-green-900'}`}>
                    {prize.sorteado ? (
                        <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sorteado
                        </>
                    ) : (
                        <>
                            <DollarSign className="h-3 w-3 mr-1" />
                            Disponible
                        </>
                    )}
                </span>
            </div>
            <div className="flex justify-end gap-2">
                {onEdit && !prize.sorteado && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onEdit(prize)}
                                    className="text-white rounded-full p-1 hover:bg-white/20"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Editar premio</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => !prize.sorteado && prize.id_prize && onDelete(prize.id_prize)}
                                className={`text-white rounded-full p-1 ${prize.sorteado ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'}`}
                                disabled={prize.sorteado}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        {prize.sorteado && (
                            <TooltipContent>
                                <p>No se puede eliminar un premio ya sorteado</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}

function ParticipantItem({ participant, onDelete, onEdit, winners = [] }: { participant: Participant; onDelete: (id: number) => void; onEdit?: (participant: Participant) => void; winners?: Array<{ id_participant: number }> }) {
    const getStatusInfo = () => {
        // Verificar si el participante es realmente un ganador (está en la API de winners)
        const isActualWinner = winners.some(w => w.id_participant === participant.id_participant)
        
        // Si NO tiene número de manilla → "No Asistente"
        if (!participant.ticket_number) {
            return {
                label: 'No Asistente',
                color: 'bg-red-500 text-white',
                icon: XCircle
            }
        }
        
        // Si tiene número de manilla Y ganó → "Ganador"
        if (participant.ticket_number && isActualWinner) {
            return {
                label: 'Ganador',
                color: 'bg-yellow-500 text-yellow-900',
                icon: Trophy
            }
        }
        
        // Si tiene número de manilla → "Asistente"
        if (participant.ticket_number) {
            return {
                label: 'Asistente',
                color: 'bg-green-500 text-white',
                icon: CheckCircle
            }
        }
        
        // Por defecto
        return {
            label: 'No Asistente',
            color: 'bg-red-500 text-white',
            icon: XCircle
        }
    }

    const statusInfo = getStatusInfo()
    const StatusIcon = statusInfo.icon

    return (
        <div className="flex flex-col h-full justify-between space-y-2">
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-300 flex-shrink-0" />
                    <h3 className="text-base sm:text-lg font-semibold text-white truncate flex-1">{participant.name || 'Unnamed Participant'}</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-green-300 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-white/80 truncate flex-1">{participant.cedula || 'No ID'}</p>
                </div>
                <div className="flex items-center space-x-2 bg-cyan-500/10 border border-cyan-400/25 rounded-xl p-2">
                    <Ticket className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-300 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/60 font-medium">Manilla</p>
                        <p className="text-xs sm:text-sm font-semibold text-cyan-200 truncate">{participant.ticket_number || 'No manilla'}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 bg-teal-500/10 border border-teal-400/25 rounded-xl p-2">
                    <Table className="h-3 w-3 sm:h-4 sm:w-4 text-teal-300 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/60 font-medium">Mesa</p>
                        <p className="text-xs sm:text-sm font-semibold text-teal-200 truncate">{participant.mesa || 'No mesa'}</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-between space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs flex items-center flex-1 justify-center ${statusInfo.color} min-w-0`}>
                    <StatusIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Estado: {statusInfo.label}</span>
                </span>
            </div>
            <div className="flex justify-end gap-2 mt-2">
                {onEdit && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onEdit(participant)}
                                    className="text-white rounded-full p-1 hover:bg-white/20"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Editar participante</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDelete(participant.id_participant)}
                                className={`text-white rounded-full p-1 ${participant.ticket_number && !participant.active ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'}`}
                                disabled={!!(participant.ticket_number && !participant.active)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        {participant.ticket_number && !participant.active && (
                            <TooltipContent>
                                <p>No se puede eliminar un ganador</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}

