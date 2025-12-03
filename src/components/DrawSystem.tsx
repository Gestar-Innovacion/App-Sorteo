import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import confetti from 'canvas-confetti'

interface Prize {
    id_prize: number;
    name: string;
    range_start: number;
    range_end: number;
    sorteado: boolean;
}

interface Participant {
    id_participant: number;
    name: string;
    cedula: string;
    ticket_number: string;
    active: boolean;
}

interface Winner {
    id_winner: number;
    id_prize: number;
    id_participant: number;
    drawdate: string;
}

const DrawSystem = () => {
    const [availablePrizes, setAvailablePrizes] = useState<Prize[]>([])
    const [activeParticipants, setActiveParticipants] = useState<Participant[]>([])
    const { toast } = useToast()

    useEffect(() => {
        const storedPrizes: Prize[] = JSON.parse(localStorage.getItem('prizes') || '[]')
        const storedParticipants: Participant[] = JSON.parse(localStorage.getItem('participants') || '[]')
        setAvailablePrizes(storedPrizes.filter(prize => !prize.sorteado))
        setActiveParticipants(storedParticipants.filter(participant => participant.active))
    }, [])

    const handleDraw = () => {
        if (availablePrizes.length === 0 || activeParticipants.length === 0) {
            toast({
                title: "No se puede realizar el sorteo",
                description: "No hay premios disponibles o participantes activos.",
                variant: "destructive",
            })
            return
        }

        const randomPrizeIndex = Math.floor(Math.random() * availablePrizes.length);
        const selectedPrize = availablePrizes[randomPrizeIndex];

        const randomParticipantIndex = Math.floor(Math.random() * activeParticipants.length);
        const selectedParticipant = activeParticipants[randomParticipantIndex];

        const newWinner: Winner = {
            id_winner: Date.now(),
            id_prize: selectedPrize.id_prize,
            id_participant: selectedParticipant.id_participant,
            drawdate: new Date().toISOString()
        };

        // Update local storage
        const updatedPrizes = availablePrizes.map(prize =>
            prize.id_prize === selectedPrize.id_prize ? { ...prize, sorteado: true } : prize
        );
        const updatedParticipants = activeParticipants.map(participant =>
            participant.id_participant === selectedParticipant.id_participant ? { ...participant, active: false } : participant
        );
        const updatedWinners = [...JSON.parse(localStorage.getItem('winners') || '[]'), newWinner];

        localStorage.setItem('prizes', JSON.stringify(updatedPrizes));
        localStorage.setItem('participants', JSON.stringify(updatedParticipants));
        localStorage.setItem('winners', JSON.stringify(updatedWinners));

        // Update state
        setAvailablePrizes(updatedPrizes.filter(prize => !prize.sorteado));
        setActiveParticipants(updatedParticipants.filter(participant => participant.active));

        // Show success message and launch confetti
        toast({
            title: "¡Sorteo realizado con éxito!",
            description: `${selectedParticipant.name} ha ganado ${selectedPrize.name}`,
        })
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        })
    }

    return (
        <div className="space-y-8 bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-center mb-6 text-green-600">¡Hora del Gran Sorteo!</h2>
            <div className="text-center">
                <Button
                    onClick={handleDraw}
                    size="lg"
                    className="animate-pulse bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-200 transform hover:scale-105"
                >
                    Aloha! Realizar Sorteo
                </Button>
            </div>
            <div className="mt-8">
                <h3 className="text-2xl font-semibold mb-4 text-center">Premios Disponibles</h3>
                {availablePrizes.length === 0 ? (
                    <p className="text-center text-xl text-gray-600">No hay premios disponibles para sortear.</p>
                ) : (
                    <ul className="list-disc pl-5 space-y-2">
                        {availablePrizes.map(prize => (
                            <li key={prize.id_prize} className="text-lg">{prize.name}</li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="mt-8">
                <h3 className="text-2xl font-semibold mb-4 text-center">Participantes Activos</h3>
                <p className="text-center text-xl">
                    Total: <span className="font-bold text-green-600">{activeParticipants.length}</span>
                </p>
            </div>
        </div>
    )
}

export default DrawSystem

