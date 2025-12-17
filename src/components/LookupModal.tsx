import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Ticket, User, CreditCard, CheckCircle, Table } from 'lucide-react'
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
    const [ticketNumberError, setTicketNumberError] = useState<string | null>(null)
    const [isTicketNumberSubmitted, setIsTicketNumberSubmitted] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('')
            setSelectedParticipant(null)
            setTicketNumber('')
            setTicketNumberError(null)
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
        setTicketNumberError(null) // Limpiar error al escribir
    }

    const handleSubmitTicketNumber = async () => {
        if (selectedParticipant && ticketNumber) {
            // Validación de longitud
            if (ticketNumber.length !== 3) {
                setTicketNumberError("El número de manilla debe tener exactamente 3 dígitos.")
                toast({
                    title: "Error",
                    description: "El número de manilla debe tener exactamente 3 dígitos.",
                    variant: "destructive",
                })
                return
            }

            const numericTicket = parseInt(ticketNumber, 10)

            // Validación de rango
            if (numericTicket < 1 || numericTicket > 500) {
                setTicketNumberError("El número de manilla debe estar entre 001 y 500.")
                toast({
                    title: "Error",
                    description: "El número de manilla debe estar entre 001 y 500.",
                    variant: "destructive",
                })
                return
            }

            const paddedTicketNumber = ticketNumber.padStart(3, '0')
            
            // Validar si el número de manilla ya existe (excepto si es el mismo participante)
            const existingParticipant = participants.find(
                p => p.ticket_number === paddedTicketNumber && 
                p.id_participant !== selectedParticipant.id_participant
            )
            
            if (existingParticipant) {
                setTicketNumberError("El número de manilla ya existe")
                toast({
                    title: "Error",
                    description: "El número de manilla ya existe",
                    variant: "destructive",
                })
                return
            }

            setTicketNumberError(null) // Limpiar error si pasa todas las validaciones
            
            try {
                const response = await request(URL_PARTICIPANT, 'PUT', {
                    id_participant: selectedParticipant.id_participant,
                    ticket_number: paddedTicketNumber,
                    active: true
                })
                if (response.status_code === 200) {
                    setSelectedParticipant({ ...selectedParticipant, ticket_number: paddedTicketNumber, active: true })
                    setIsTicketNumberSubmitted(true)
                    setTicketNumber('')
                    setTicketNumberError(null)
                    toast({
                        title: "Éxito",
                        description: "El número de manilla ha sido registrado exitosamente y el participante ha sido activado.",
                        variant: "success",
                    })
                } else {
                    const errorMessage = response.data?.detail || "Error al registrar el número de manilla"
                    setTicketNumberError(errorMessage)
                    throw new Error(errorMessage)
                }
            } catch (error: any) {
                console.error('Error registering ticket number:', error)
                const errorMessage = error?.response?.data?.detail || error?.message || "Hubo un problema al registrar el número de manilla. Por favor, inténtelo de nuevo."
                setTicketNumberError(errorMessage)
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                })
            }
        } else if (!selectedParticipant) {
            toast({
                title: "Error",
                description: "Por favor, seleccione un participante antes de registrar el número de manilla.",
                variant: "destructive",
            })
        } else if (!ticketNumber) {
            setTicketNumberError("Por favor, ingrese un número de manilla antes de registrar.")
            toast({
                title: "Error",
                description: "Por favor, ingrese un número de manilla antes de registrar.",
                variant: "destructive",
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                className="bg-gradient-to-br from-slate-800 via-teal-900 to-cyan-900 border-none text-white w-[95vw] max-w-[95vw] sm:max-w-[425px] rounded-3xl overflow-hidden p-3 sm:p-4"
            >
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-2">Buscar Participante</DialogTitle>
                    <DialogDescription className="text-white/80 text-center text-xs sm:text-sm">
                        Ingrese el número de cédula o nombre completo para buscar
                    </DialogDescription>
                </DialogHeader>
                <div className="relative mb-3">
                    <Input
                        placeholder="Cédula o nombre"
                        value={searchTerm}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full py-3 sm:py-4 pl-10 sm:pl-12 pr-4 text-sm sm:text-base"
                    />
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <AnimatePresence>
                    {selectedParticipant && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="mt-3 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl overflow-hidden"
                        >
                            <div className="p-3 sm:p-4 space-y-2 sm:space-y-2.5">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="bg-white/30 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base sm:text-lg md:text-xl font-bold truncate">{selectedParticipant.name}</h3>
                                        <p className="text-white/70 text-xs sm:text-sm">Participante</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="bg-white/30 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                    <p className="text-sm sm:text-base md:text-lg truncate"><span className="font-semibold">CC:</span> {selectedParticipant.cedula}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1.5 sm:space-y-0 space-x-0 sm:space-x-3 bg-cyan-500/10 border border-cyan-400/30 rounded-2xl p-2 sm:p-3">
                                    <div className="bg-cyan-500/30 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                                        <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-200" />
                                    </div>
                                    <div className="flex-1 w-full sm:w-auto">
                                        {!isTicketNumberSubmitted && (
                                            <>
                                                <Input
                                                    type="text"
                                                    placeholder="001-500"
                                                    value={ticketNumber}
                                                    onChange={handleTicketNumberChange}
                                                    className={`bg-white/15 border ${ticketNumberError ? 'border-red-400' : 'border-cyan-400/40'} text-white placeholder:text-white/60 rounded-xl py-1.5 px-2.5 text-sm sm:text-base w-full`}
                                                    maxLength={3}
                                                />
                                                {ticketNumberError ? (
                                                    <p className="text-xs text-red-300 mt-0.5 font-medium">
                                                        {ticketNumberError}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-white/70 mt-0.5">
                                                        Número de manilla: 3 dígitos, entre 001 y 500
                                                    </p>
                                                )}
                                            </>
                                        )}
                                        {isTicketNumberSubmitted && (
                                            <div className="flex items-center gap-2">
                                                <p className="text-xl sm:text-2xl font-bold text-cyan-200">{selectedParticipant.ticket_number}</p>
                                                <span className="text-xs text-white/80">Manilla</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 sm:space-x-3 bg-teal-500/10 border border-teal-400/30 rounded-2xl p-2 sm:p-3">
                                    <div className="bg-teal-500/30 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                                        <Table className="h-4 w-4 sm:h-5 sm:w-5 text-teal-200" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white/70 font-medium mb-0.5">Mesa</p>
                                        <p className="text-base sm:text-lg md:text-xl font-semibold text-white truncate">
                                            {selectedParticipant.mesa || 'No asignada'}
                                        </p>
                                        {!selectedParticipant.mesa && (
                                            <p className="text-xs text-white/60 italic mt-1">
                                                Por favor, busca tu mesa correspondiente basado en tu información
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className={`bg-white/30 p-1.5 sm:p-2 rounded-full flex-shrink-0 ${selectedParticipant.active || isTicketNumberSubmitted ? 'bg-green-500' : 'bg-red-500'}`}>
                                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                    <p className="text-sm sm:text-base md:text-lg">
                                        <span className="font-semibold">Estado:</span> {selectedParticipant.active || isTicketNumberSubmitted ? 'Activo' : 'Inactivo'}
                                    </p>
                                </div>
                            </div>
                            {!isTicketNumberSubmitted && (
                                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-2 sm:p-3">
                                    <Button
                                        onClick={handleSubmitTicketNumber}
                                        className="w-full bg-white text-teal-900 hover:bg-teal-50 transition-colors duration-200 py-1.5 sm:py-2 rounded-2xl font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={ticketNumber.length !== 3}
                                    >
                                        Registrar Número de Manilla
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
                {error && (
                    <p className="text-center text-red-400 mt-2 text-xs sm:text-sm">
                        {error}
                    </p>
                )}
                {!selectedParticipant && !error && searchTerm.length > 0 && (
                    <p className="text-center text-white/70 mt-2 text-xs sm:text-sm">
                        Buscando...
                    </p>
                )}
                {!selectedParticipant && !error && searchTerm.length === 0 && (
                    <p className="text-center text-white/70 mt-2 text-xs sm:text-sm">
                        Ingrese el número de cédula o nombre completo para buscar
                    </p>
                )}
            </DialogContent>
        </Dialog>
    )
}

