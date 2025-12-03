import { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

interface Winner {
    id_winner: number;
    id_prize: number;
    id_participant: number;
    drawdate: string;
}

interface Prize {
    id_prize: number;
    name: string;
}

interface Participant {
    id_participant: number;
    name: string;
}

export default function WinnerManagement() {
    const [winners, setWinners] = useState<Winner[]>([])
    const [prizes, setPrizes] = useState<Prize[]>([])
    const [participants, setParticipants] = useState<Participant[]>([])

    useEffect(() => {
        const storedWinners = JSON.parse(localStorage.getItem('winners') || '[]')
        const storedPrizes = JSON.parse(localStorage.getItem('prizes') || '[]')
        const storedParticipants = JSON.parse(localStorage.getItem('participants') || '[]')
        setWinners(storedWinners)
        setPrizes(storedPrizes)
        setParticipants(storedParticipants)
    }, [])

    const getPrizeName = (id_prize: number) => {
        const prize = prizes.find(p => p.id_prize === id_prize)
        return prize ? prize.name : 'Unknown Prize'
    }

    const getParticipantName = (id_participant: number) => {
        const participant = participants.find(p => p.id_participant === id_participant)
        return participant ? participant.name : 'Unknown Participant'
    }

    return (
        <div className="space-y-8 bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-center mb-6 text-yellow-600">¡Nuestros Afortunados Ganadores!</h2>
            {winners.length === 0 ? (
                <p className="text-center text-xl text-gray-600">Aún no hay ganadores. ¡Realiza un sorteo para ver resultados aquí!</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID Ganador</TableHead>
                            <TableHead>Nombre del Ganador</TableHead>
                            <TableHead>Premio</TableHead>
                            <TableHead>Fecha del Sorteo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {winners.map((winner) => (
                            <TableRow key={winner.id_winner} className="hover:bg-yellow-100 transition-colors duration-200">
                                <TableCell>{winner.id_winner}</TableCell>
                                <TableCell className="font-semibold">{getParticipantName(winner.id_participant)}</TableCell>
                                <TableCell>{getPrizeName(winner.id_prize)}</TableCell>
                                <TableCell>{new Date(winner.drawdate).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}

