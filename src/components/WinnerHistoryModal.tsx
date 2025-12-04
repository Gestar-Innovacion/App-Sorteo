import { memo, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Winner } from '../types'
import { Trophy, Calendar, Gift, User, Search, Filter, X, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface WinnerHistoryModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    winners: Winner[]
}

export const WinnerHistoryModal = memo(function WinnerHistoryModal({
    isOpen,
    onOpenChange,
    winners
}: WinnerHistoryModalProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterPrize, setFilterPrize] = useState<string>('')
    const [filterDate, setFilterDate] = useState<string>('')
    const [showFilters, setShowFilters] = useState(false)

    // Obtener lista única de premios para el filtro
    const uniquePrizes = useMemo(() => {
        const prizes = [...new Set(winners.map(w => w.prize_name))]
        return prizes.sort()
    }, [winners])

    // Obtener lista única de fechas para el filtro
    const uniqueDates = useMemo(() => {
        const dates = [...new Set(winners.map(w => {
            const date = new Date(w.drawdate)
            return date.toISOString().split('T')[0]
        }))]
        return dates.sort().reverse()
    }, [winners])

    // Filtrar ganadores
    const filteredWinners = useMemo(() => {
        return winners.filter(winner => {
            const matchesSearch = 
                (winner.participant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (winner.prize_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (winner.ticket_number || '').includes(searchTerm)

            const matchesPrize = !filterPrize || winner.prize_name === filterPrize

            const winnerDate = new Date(winner.drawdate).toISOString().split('T')[0]
            const matchesDate = !filterDate || winnerDate === filterDate

            return matchesSearch && matchesPrize && matchesDate
        })
    }, [winners, searchTerm, filterPrize, filterDate])

    // Limpiar filtros
    const clearFilters = () => {
        setSearchTerm('')
        setFilterPrize('')
        setFilterDate('')
    }

    // Exportar a CSV
    const exportToCSV = () => {
        const headers = ['Nombre', 'Ticket', 'Premio', 'Fecha']
        const rows = filteredWinners.map(w => [
            w.participant_name,
            w.ticket_number,
            w.prize_name,
            new Date(w.drawdate).toLocaleString('es-CO')
        ])

        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.join(';'))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `ganadores_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    const hasActiveFilters = searchTerm || filterPrize || filterDate

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white rounded-3xl border border-white/20 overflow-hidden">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                        <Trophy className="h-7 w-7 text-yellow-400" />
                        Historial de Ganadores
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Barra de búsqueda y filtros */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por nombre, premio o ticket..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className={`border-white/20 ${showFilters ? 'bg-white/20' : 'bg-white/5'} hover:bg-white/20`}
                            >
                                <Filter className="h-4 w-4 mr-1" />
                                Filtros
                                {hasActiveFilters && (
                                    <span className="ml-1 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        !
                                    </span>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportToCSV}
                                className="border-white/20 bg-white/5 hover:bg-white/20"
                                disabled={filteredWinners.length === 0}
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Exportar
                            </Button>
                        </div>
                    </div>

                    {/* Panel de filtros */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Filtrar por Premio</label>
                                            <select
                                                value={filterPrize}
                                                onChange={(e) => setFilterPrize(e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                                            >
                                                <option value="" className="bg-gray-900">Todos los premios</option>
                                                {uniquePrizes.map(prize => (
                                                    <option key={prize} value={prize} className="bg-gray-900">{prize}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Filtrar por Fecha</label>
                                            <select
                                                value={filterDate}
                                                onChange={(e) => setFilterDate(e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                                            >
                                                <option value="" className="bg-gray-900">Todas las fechas</option>
                                                {uniqueDates.map(date => (
                                                    <option key={date} value={date} className="bg-gray-900">
                                                        {new Date(date).toLocaleDateString('es-CO', { 
                                                            weekday: 'short', 
                                                            day: 'numeric', 
                                                            month: 'short' 
                                                        })}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Limpiar filtros
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Contador de resultados */}
                    <div className="text-sm text-gray-400">
                        Mostrando {filteredWinners.length} de {winners.length} ganadores
                    </div>

                    {/* Lista de ganadores */}
                    <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filteredWinners.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No se encontraron ganadores</p>
                                {hasActiveFilters && (
                                    <Button
                                        variant="link"
                                        onClick={clearFilters}
                                        className="text-yellow-400 mt-2"
                                    >
                                        Limpiar filtros
                                    </Button>
                                )}
                            </div>
                        ) : (
                            filteredWinners.map((winner, index) => (
                                <motion.div
                                    key={winner.id_winner}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-yellow-500/20 rounded-full p-2">
                                                <Trophy className="h-5 w-5 text-yellow-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <span className="font-semibold">{winner.participant_name}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                                    <span className="bg-white/10 px-2 py-0.5 rounded">#{winner.ticket_number}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1 text-green-400">
                                                <Gift className="h-4 w-4" />
                                                <span className="font-medium">{winner.prize_name}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Calendar className="h-3 w-3" />
                                                <span>{new Date(winner.drawdate).toLocaleString('es-CO')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(255, 255, 255, 0.3);
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    )
})

