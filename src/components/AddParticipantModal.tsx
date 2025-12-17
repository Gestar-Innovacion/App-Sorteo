import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Participant } from '../types'

interface AddParticipantModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onAddParticipant: (participant: { name: string; cedula: string; ticket_number?: string; mesa?: string }) => Promise<{ success: boolean; message: string }>
    existingParticipants: Participant[]
}

export function AddParticipantModal({ isOpen, onOpenChange, onAddParticipant, existingParticipants }: AddParticipantModalProps) {
    const [name, setName] = useState('')
    const [cedula, setCedula] = useState('')
    const [ticketNumber, setTicketNumber] = useState('')
    const [mesa, setMesa] = useState('')
    const [includeTicketNumber, setIncludeTicketNumber] = useState(false)
    const [errors, setErrors] = useState<{ name?: string; cedula?: string; ticketNumber?: string; submit?: string }>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!isOpen) {
            setName('')
            setCedula('')
            setTicketNumber('')
            setMesa('')
            setIncludeTicketNumber(false)
            setErrors({})
        }
    }, [isOpen])

    const validateField = (field: 'name' | 'cedula' | 'ticketNumber', value: string) => {
        let error = ''
        switch (field) {
            case 'name':
                if (value.trim() === '') {
                    error = 'El nombre es requerido'
                } else if (existingParticipants.some(p => p.name.toLowerCase() === value.toLowerCase())) {
                    error = 'Ya existe un participante con este nombre'
                }
                break
            case 'cedula':
                if (value.trim() === '') {
                    error = 'La cédula es requerida'
                } else if (value.length > 10) {
                    error = 'La cédula no puede tener más de 10 dígitos'
                } else if (existingParticipants.some(p => p.cedula === value)) {
                    error = 'Ya existe un participante con esta cédula'
                }
                break
            case 'ticketNumber':
                if (includeTicketNumber) {
                    if (value.trim() === '') {
                        error = 'El número de manilla es requerido'
                    } else if (value.length !== 3) {
                        error = 'El número de manilla debe tener 3 dígitos'
                    } else if (existingParticipants.some(p => p.ticket_number === value)) {
                        error = 'Ya existe un participante con este número de manilla'
                    }
                }
                break
        }
        setErrors(prev => ({ ...prev, [field]: error }))
        return error === ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const isNameValid = validateField('name', name)
        const isCedulaValid = validateField('cedula', cedula)
        const isTicketNumberValid = validateField('ticketNumber', ticketNumber)

        if (isNameValid && isCedulaValid && (includeTicketNumber ? isTicketNumberValid : true)) {
            const participant = {
                name,
                cedula,
                ...(mesa ? { mesa: mesa.trim() } : {}),
                ...(includeTicketNumber && ticketNumber ? { ticket_number: ticketNumber } : {})
            }

            try {
                const result = await onAddParticipant(participant)
                if (result.success) {
                    onOpenChange(false)
                } else {
                    setErrors(prev => ({ ...prev, submit: result.message }))
                }
            } catch (error) {
                setErrors(prev => ({ ...prev, submit: 'Ocurrió un error al agregar el participante. Por favor, inténtelo de nuevo.' }))
            }
        }

        setIsSubmitting(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-full bg-gradient-to-br from-teal-700 to-blue-900 text-white rounded-3xl border-2 border-white/20 shadow-xl p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl">Agregar Participante</DialogTitle>
                    <DialogDescription className="text-white/70 text-sm sm:text-base">
                        Ingrese los datos del nuevo participante aquí. Haga clic en guardar cuando termine.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="name" className="sm:text-right text-sm sm:text-base">
                                Nombre
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[0-9]/g, '')
                                    setName(value)
                                    validateField('name', value)
                                }}
                                onBlur={() => validateField('name', name)}
                                className="col-span-1 sm:col-span-3 bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl text-sm sm:text-base py-2 sm:py-3"
                                required
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs sm:text-sm">{errors.name}</p>}
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="cedula" className="sm:text-right text-sm sm:text-base">
                                Cédula
                            </Label>
                            <Input
                                id="cedula"
                                value={cedula}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                                    setCedula(value)
                                    validateField('cedula', value)
                                }}
                                onBlur={() => validateField('cedula', cedula)}
                                className="col-span-1 sm:col-span-3 bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl text-sm sm:text-base py-2 sm:py-3"
                                required
                                maxLength={10}
                            />
                        </div>
                        {errors.cedula && <p className="text-red-500 text-xs sm:text-sm">{errors.cedula}</p>}
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="mesa" className="sm:text-right text-sm sm:text-base">
                                Mesa
                            </Label>
                            <Input
                                id="mesa"
                                value={mesa}
                                onChange={(e) => {
                                    setMesa(e.target.value)
                                }}
                                className="col-span-1 sm:col-span-3 bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl text-sm sm:text-base py-2 sm:py-3"
                                placeholder="Opcional"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="includeTicketNumber"
                                checked={includeTicketNumber}
                                onCheckedChange={(checked) => {
                                    setIncludeTicketNumber(checked as boolean)
                                    if (!checked) {
                                        setTicketNumber('')
                                        setErrors(prev => ({ ...prev, ticketNumber: undefined }))
                                    }
                                }}
                                className="bg-white/10 border-white/20"
                            />
                            <Label
                                htmlFor="includeTicketNumber"
                                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Agregar número de manilla
                            </Label>
                        </div>
                        {includeTicketNumber && (
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor="ticketNumber" className="sm:text-right text-sm sm:text-base">
                                    Número de Manilla
                                </Label>
                                <Input
                                    id="ticketNumber"
                                    value={ticketNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 3)
                                        setTicketNumber(value)
                                        validateField('ticketNumber', value)
                                    }}
                                    onBlur={() => validateField('ticketNumber', ticketNumber)}
                                    className="col-span-1 sm:col-span-3 bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl text-sm sm:text-base py-2 sm:py-3"
                                    required={includeTicketNumber}
                                    maxLength={3}
                                />
                            </div>
                        )}
                        {errors.ticketNumber && <p className="text-red-500 text-xs sm:text-sm">{errors.ticketNumber}</p>}
                    </div>
                    {errors.submit && (
                        <div className="text-red-500 text-xs sm:text-sm mb-3 sm:mb-4">
                            {errors.submit}
                        </div>
                    )}
                    <DialogFooter className="mt-2 sm:mt-4">
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white transition-colors duration-200 rounded-xl py-2 sm:py-3 text-sm sm:text-base"
                            disabled={isSubmitting || Object.values(errors).some(error => error !== undefined && error !== '')}
                        >
                            {isSubmitting ? 'Guardando...' : 'Guardar participante'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

