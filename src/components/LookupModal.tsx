import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Ticket, User, CreditCard, CheckCircle } from 'lucide-react'
import { Participant } from '../types'
import { request } from '@/services/index'
import { URL_PARTICIPANT } from '@/constants/index'
import { useToast } from '@/hooks/use-toast'

interface LookupModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function LookupModal({ isOpen, onOpenChange }: LookupModalProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [ticketNumber, setTicketNumber] = useState('')
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
    const [participants, setParticipants] = useState<Participant[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isTicketNumberSubmitted, setIsTicketNumberSubmitted] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('')
            setSelectedParticipant(null)
        }
    }, [isOpen])

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await request(URL_PARTICIPANT, 'GET')
                if (response.status_code === 200) {
                    setParticipants(response.data)
                }
            } catch (error) {
                console.error('Error fetching participants:', error)
            }
        }

        if (isOpen) {
            fetchParticipants()
        }
    }, [isOpen])

    useEffect(() => {
        if (searchTerm.length > 0) {
            const foundParticipant = participants.find(p => p.cedula === searchTerm || p.name.toLowerCase() === searchTerm.toLowerCase())
            if (foundParticipant) {
                setSelectedParticipant(foundParticipant)
                setError(null)
                setIsTicketNumberSubmitted(!!foundParticipant.ticket_number)
            } else {
                setSelectedParticipant(null)
                setError('No se encontró ningún participante con esa cédula o nombre.')
            }
        } else {
            setSelectedParticipant(null)
            setError(null)
        }
    }, [searchTerm, participants])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchTerm(value)
    }

    const handleTicketNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '') // Solo permite números

        // Limita a 3 dígitos
        if (value.length > 3) {
            value = value.slice(0, 3)
        }

        setTicketNumber(value)
    }

    const handleSubmitTicketNumber = async () => {
        if (selectedParticipant && ticketNumber) {
            // Validación de longitud
            if (ticketNumber.length !== 3) {
                toast({
                    title: "Error",
                    description: "El número de sorteo debe tener exactamente 3 dígitos.",
                    variant: "destructive",
                })
                return
            }

            const numericTicket = parseInt(ticketNumber, 10)

            // Validación de rango
            if (numericTicket < 1 || numericTicket > 500) {
                toast({
                    title: "Error",
                    description: "El número de sorteo debe estar entre 001 y 500.",
                    variant: "destructive",
                })
                return
            }

            const paddedTicketNumber = ticketNumber.padStart(3, '0')
            try {
                const response = await request(URL_PARTICIPANT, 'PUT', {
                    id_participant: selectedParticipant.id_participant,
                    ticket_number: paddedTicketNumber,
                    active: true
                })
                if (response.status_code === 200) {
                    setSelectedParticipant({ ...selectedParticipant, ticket_number: paddedTicketNumber, active: true })
                    setIsTicketNumberSubmitted(true)
                    toast({
                        title: "Éxito",
                        description: "El número de sorteo ha sido registrado exitosamente y el participante ha sido activado.",
                        variant: "success",
                    })
                } else {
                    throw new Error(response.data.detail || "Error al registrar el número de sorteo")
                }
            } catch (error) {
                console.error('Error registering ticket number:', error)
                toast({
                    title: "Error",
                    description: "Hubo un problema al registrar el número de sorteo. Por favor, inténtelo de nuevo.",
                    variant: "destructive",
                })
            }
        } else if (!selectedParticipant) {
            toast({
                title: "Error",
                description: "Por favor, seleccione un participante antes de registrar el número de sorteo.",
                variant: "destructive",
            })
        } else if (!ticketNumber) {
            toast({
                title: "Error",
                description: "Por favor, ingrese un número de sorteo antes de registrar.",
                variant: "destructive",
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                className="bg-gradient-to-br from-slate-800 via-teal-900 to-cyan-900 border-none text-white sm:max-w-[425px] rounded-3xl overflow-hidden"
            >
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-center mb-6">Buscar Participante</DialogTitle>
                    <DialogDescription className="text-white/80 text-center">
                        Ingrese el número de cédula o nombre completo para buscar
                    </DialogDescription>
                </DialogHeader>
                <div className="relative mb-4">
                    <Input
                        placeholder="Ingrese número de cédula o nombre completo"
                        value={searchTerm}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full py-6 pl-12 pr-4 text-lg"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 h-6 w-6" />
                </div>
                <AnimatePresence>
                    {selectedParticipant && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="mt-6 bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden"
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white/30 p-3 rounded-full">
                                        <User className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">{selectedParticipant.name}</h3>
                                        <p className="text-white/70">Participante</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white/30 p-3 rounded-full">
                                        <CreditCard className="h-6 w-6 text-white" />
                                    </div>
                                    <p className="text-xl"><span className="font-semibold">CC:</span> {selectedParticipant.cedula}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white/30 p-3 rounded-full">
                                        <Ticket className="h-6 w-6 text-white" />
                                    </div>
                                    {!isTicketNumberSubmitted && (
                                        <>
                                            <Input
                                                type="text"
                                                placeholder="Ingrese número de sorteo (001-500)"
                                                value={ticketNumber}
                                                onChange={handleTicketNumberChange}
                                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl py-2 px-3 text-lg"
                                                maxLength={3}
                                            />
                                            <p className="text-xs text-white/70 mt-1">
                                                El número de sorteo debe ser de 3 dígitos, entre 001 y 500.
                                            </p>
                                        </>
                                    )}
                                    {isTicketNumberSubmitted && (
                                        <p className="text-3xl font-bold">{selectedParticipant.ticket_number}</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className={`bg-white/30 p-3 rounded-full ${selectedParticipant.active || isTicketNumberSubmitted ? 'bg-green-500' : 'bg-red-500'}`}>
                                        <CheckCircle className="h-6 w-6 text-white" />
                                    </div>
                                    <p className="text-xl">
                                        <span className="font-semibold">Estado:</span> {selectedParticipant.active || isTicketNumberSubmitted ? 'Activo' : 'Inactivo'}
                                    </p>
                                </div>
                            </div>
                            {!isTicketNumberSubmitted && (
                                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4">
                                    <Button
                                        onClick={handleSubmitTicketNumber}
                                        className="w-full bg-white text-teal-900 hover:bg-teal-50 transition-colors duration-200 py-2 rounded-xl font-semibold"
                                        disabled={ticketNumber === ''}
                                    >
                                        Registrar Número de Sorteo
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
                {error && (
                    <p className="text-center text-red-400 mt-4">
                        {error}
                    </p>
                )}
                {!selectedParticipant && !error && searchTerm.length > 0 && (
                    <p className="text-center text-white/70 mt-4">
                        Buscando...
                    </p>
                )}
                {!selectedParticipant && !error && searchTerm.length === 0 && (
                    <p className="text-center text-white/70 mt-4">
                        Ingrese el número de cédula o nombre completo para buscar
                    </p>
                )}
            </DialogContent>
        </Dialog>
    )
}

