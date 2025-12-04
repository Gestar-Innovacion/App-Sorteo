import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'

interface Prize {
    id_prize: number;
    name: string;
    range_start: number;
    range_end: number;
    sorteado: boolean;
}

export default function PrizeManagement() {
    const [prizes, setPrizes] = useState<Prize[]>([])
    const [newPrize, setNewPrize] = useState({ name: '', range_start: '', range_end: '' })
    const { toast } = useToast()

    useEffect(() => {
        const storedPrizes = JSON.parse(localStorage.getItem('prizes') || '[]')
        setPrizes(storedPrizes)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPrize({ ...newPrize, [e.target.name]: e.target.value })
    }

    const handleAddPrize = () => {
        const prize: Prize = {
            id_prize: prizes.length + 1,
            name: newPrize.name,
            range_start: parseInt(newPrize.range_start),
            range_end: parseInt(newPrize.range_end),
            sorteado: false
        }
        const updatedPrizes = [...prizes, prize]
        setPrizes(updatedPrizes)
        localStorage.setItem('prizes', JSON.stringify(updatedPrizes))
        setNewPrize({ name: '', range_start: '', range_end: '' })
        toast({
            title: "Premio añadido",
            description: "El premio ha sido agregado exitosamente.",
        })
    }

    const handleDeletePrize = (id_prize: number) => {
        const updatedPrizes = prizes.filter(prize => prize.id_prize !== id_prize)
        setPrizes(updatedPrizes)
        localStorage.setItem('prizes', JSON.stringify(updatedPrizes))
        toast({
            title: "Premio eliminado",
            description: "El premio ha sido eliminado exitosamente.",
        })
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const csv = event.target?.result
                if (typeof csv === 'string') {
                    const lines = csv.split('\n')
                    const newPrizes: Prize[] = lines.slice(1).map((line, index) => {
                        const [name, range_start, range_end] = line.split(',')
                        return {
                            id_prize: prizes.length + index + 1,
                            name: name.trim(),
                            range_start: parseInt(range_start.trim()),
                            range_end: parseInt(range_end.trim()),
                            sorteado: false
                        }
                    })
                    const updatedPrizes = [...prizes, ...newPrizes]
                    setPrizes(updatedPrizes)
                    localStorage.setItem('prizes', JSON.stringify(updatedPrizes))
                    toast({
                        title: "Archivo cargado",
                        description: "El archivo CSV ha sido procesado exitosamente.",
                    })
                }
            }
            reader.readAsText(file)
        }
    }

    return (
        <div className="space-y-8 bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-center mb-6 text-indigo-800">Aloha! Gestión de Premios</h2>
            <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-lg">Nombre del Premio</Label>
                    <Input id="name" name="name" value={newPrize.name} onChange={handleInputChange} className="border-2 border-indigo-300 focus:border-indigo-500" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="range_start" className="text-lg">Rango Inicial</Label>
                    <Input id="range_start" name="range_start" type="number" value={newPrize.range_start} onChange={handleInputChange} className="border-2 border-indigo-300 focus:border-indigo-500" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="range_end" className="text-lg">Rango Final</Label>
                    <Input id="range_end" name="range_end" type="number" value={newPrize.range_end} onChange={handleInputChange} className="border-2 border-indigo-300 focus:border-indigo-500" />
                </div>
                <div className="flex items-end">
                    <Button onClick={handleAddPrize} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 transform hover:scale-105">
                        Agregar Premio
                    </Button>
                </div>
            </div>
            <div>
                <Input type="file" accept=".csv" onChange={handleFileUpload} className="mb-2" />
                <p className="text-sm text-gray-500 mt-2">Cargar premios desde archivo CSV</p>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID Premio</TableHead>
                        <TableHead>Nombre del Premio</TableHead>
                        <TableHead>Rango Inicial</TableHead>
                        <TableHead>Rango Final</TableHead>
                        <TableHead>Sorteado</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {prizes.map((prize) => (
                        <TableRow key={prize.id_prize}>
                            <TableCell>{prize.id_prize}</TableCell>
                            <TableCell>{prize.name}</TableCell>
                            <TableCell>{prize.range_start}</TableCell>
                            <TableCell>{prize.range_end}</TableCell>
                            <TableCell>{prize.sorteado ? 'Sí' : 'No'}</TableCell>
                            <TableCell>
                                <Button variant="destructive" onClick={() => handleDeletePrize(prize.id_prize)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded-full transition-all duration-200 transform hover:scale-105">
                                    Eliminar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

