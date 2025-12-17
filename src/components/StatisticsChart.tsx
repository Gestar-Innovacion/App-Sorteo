import { memo, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { Prize, Participant, Winner } from '../types'
import { Trophy, Users, Gift, TrendingUp } from 'lucide-react'

interface StatisticsChartProps {
    prizes: Prize[]
    participants: Participant[]
    winners: Winner[]
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']

export const StatisticsChart = memo(function StatisticsChart({ 
    prizes, 
    participants, 
    winners 
}: StatisticsChartProps) {
    // Datos para el gráfico de participación
    const participationData = useMemo(() => {
        const active = participants.filter(p => p.active).length
        const inactive = participants.filter(p => !p.active).length
        const winners_count = winners.length
        
        return [
            { name: 'Activos', value: active, color: '#10B981' },
            { name: 'Inactivos', value: inactive, color: '#6B7280' },
            { name: 'Ganadores', value: winners_count, color: '#F59E0B' },
        ].filter(item => item.value > 0)
    }, [participants, winners])

    // Datos para el gráfico de premios
    const prizesData = useMemo(() => {
        return prizes.map((prize, index) => {
            const rangeStart = Number(prize.range_start) || 0
            const rangeEnd = Number(prize.range_end) || 0
            const eligibleParticipants = participants.filter(p => {
                if (!p.ticket_number) return false
                const ticket = parseInt(p.ticket_number.replace(/\D/g, ''), 10)
                return !isNaN(ticket) && ticket >= rangeStart && ticket <= rangeEnd
            }).length

            return {
                name: prize.name.length > 15 ? prize.name.substring(0, 12) + '...' : prize.name,
                fullName: prize.name,
                elegibles: eligibleParticipants,
                sorteado: prize.sorteado ? 1 : 0,
                color: COLORS[index % COLORS.length]
            }
        })
    }, [prizes, participants])

    // Estadísticas generales
    const stats = useMemo(() => {
        const totalPrizes = prizes.length
        const sortedPrizes = prizes.filter(p => p.sorteado).length
        const pendingPrizes = totalPrizes - sortedPrizes
        const totalParticipants = participants.length
        const activeParticipants = participants.filter(p => p.active).length
        const totalWinners = winners.length

        return {
            totalPrizes,
            sortedPrizes,
            pendingPrizes,
            totalParticipants,
            activeParticipants,
            totalWinners,
            completionRate: totalPrizes > 0 ? Math.round((sortedPrizes / totalPrizes) * 100) : 0
        }
    }, [prizes, participants, winners])

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 shadow-xl">
                    <p className="text-white font-medium">{payload[0].payload.fullName || payload[0].name}</p>
                    <p className="text-sm text-gray-300">
                        {payload[0].name === 'elegibles' ? 'Elegibles: ' : ''}{payload[0].value}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-6">
            {/* Tarjetas de estadísticas rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl p-3 border border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs text-emerald-300">Participantes</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.activeParticipants}</p>
                    <p className="text-xs text-gray-400">de {stats.totalParticipants} totales</p>
                </div>

                <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-3 border border-amber-500/30">
                    <div className="flex items-center gap-2 mb-1">
                        <Trophy className="h-4 w-4 text-amber-400" />
                        <span className="text-xs text-amber-300">Ganadores</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalWinners}</p>
                    <p className="text-xs text-gray-400">premios entregados</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-3 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-1">
                        <Gift className="h-4 w-4 text-purple-400" />
                        <span className="text-xs text-purple-300">Premios</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.pendingPrizes}</p>
                    <p className="text-xs text-gray-400">pendientes de {stats.totalPrizes}</p>
                </div>

                <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl p-3 border border-cyan-500/30">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-cyan-400" />
                        <span className="text-xs text-cyan-300">Progreso</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
                    <p className="text-xs text-gray-400">completado</p>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gráfico de participación */}
                {participationData.length > 0 && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3 text-center">Estado de Participantes</h4>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={participationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {participationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36}
                                        formatter={(value) => <span className="text-gray-600 text-xs">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Gráfico de premios */}
                {prizesData.length > 0 && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3 text-center">Elegibles por Premio</h4>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={prizesData} layout="vertical">
                                    <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                                    <YAxis 
                                        type="category" 
                                        dataKey="name" 
                                        tick={{ fill: '#9CA3AF', fontSize: 10 }} 
                                        width={80}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="elegibles" radius={[0, 4, 4, 0]}>
                                        {prizesData.map((entry, index) => (
                                            <Cell key={`bar-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
})

