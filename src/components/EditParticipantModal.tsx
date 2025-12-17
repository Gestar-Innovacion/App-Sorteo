import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { User, Save } from 'lucide-react'
import { Participant } from '../types'

interface EditParticipantModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    participant: Participant | null
    onUpdateParticipant: (participant: Participant) => Promise<{ success: boolean; message: string }>
    existingParticipants: Participant[]
}

export function EditParticipantModal({ isOpen, onOpenChange, participant, onUpdateParticipant, existingParticipants }: EditParticipantModalProps) {
    const [name, setName] = useState('')
    const [cedula, setCedula] = useState('')
    const [ticketNumber, setTicketNumber] = useState('')
    const [mesa, setMesa] = useState('')
    const [active, setActive] = useState(true)
    const [errors, setErrors] = useState<{ name?: string; cedula?: string; ticketNumber?: string; submit?: string }>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (participant) {
            setName(participant.name || '')
            setCedula(participant.cedula || '')
            setTicketNumber(participant.ticket_number || '')
            setMesa(participant.mesa || '')
            setActive(participant.active ?? true)
            setErrors({})
        }
    }, [participant, isOpen])

    const validateField = (field: 'name' | 'cedula' | 'ticketNumber', value: string) => {
        let error = ''
        switch (field) {
            case 'name':
                if (value.trim() === '') {
                    error = 'El nombre es requerido'
                } else if (participant && existingParticipants.some(p => p.id_participant !== participant.id_participant && p.name.toLowerCase() === value.toLowerCase())) {
                    error = 'Ya existe un participante con este nombre'
                }
                break
            case 'cedula':
                if (value.trim() === '') {
                    error = 'La cédula es requerida'
                } else if (value.length > 10) {
                    error = 'La cédula no puede tener más de 10 dígitos'
                } else if (participant && existingParticipants.some(p => p.id_participant !== participant.id_participant && p.cedula === value)) {
                    error = 'Ya existe un participante con esta cédula'
                }
                break
            case 'ticketNumber':
                if (value.trim() !== '' && value.length !== 3) {
                    error = 'El número de manilla debe tener 3 dígitos o estar vacío'
                } else if (value.trim() !== '' && participant && existingParticipants.some(p => p.id_participant !== participant.id_participant && p.ticket_number === value)) {
                    error = 'Ya existe un participante con este número de manilla'
                }
                break
        }
        setErrors(prev => ({ ...prev, [field]: error }))
        return error === ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!participant) return

        setIsSubmitting(true)

        const isNameValid = validateField('name', name)
        const isCedulaValid = validateField('cedula', cedula)
        const isTicketNumberValid = validateField('ticketNumber', ticketNumber)

        if (isNameValid && isCedulaValid && isTicketNumberValid) {
            const updatedParticipant: Participant = {
                ...participant,
                name: name.trim(),
                cedula: cedula.trim(),
                ticket_number: ticketNumber.trim() || undefined,
                mesa: mesa.trim() || undefined,
                active: active
            }

            try {
                const result = await onUpdateParticipant(updatedParticipant)
                if (result.success) {
                    onOpenChange(false)
                } else {
                    setErrors(prev => ({ ...prev, submit: result.message }))
                }
            } catch (error) {
                setErrors(prev => ({ ...prev, submit: 'Ocurrió un error al actualizar el participante. Por favor, inténtelo de nuevo.' }))
            }
        }

        setIsSubmitting(false)
    }

    if (!participant) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog open={isOpen} onOpenChange={onOpenChange}>
                    <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-full bg-gradient-to-br from-teal-700 to-blue-900 text-white rounded-3xl border-2 border-white/20 shadow-xl p-4 sm:p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-center flex items-center justify-center text-white flex-wrap gap-2">
                                <User className="mr-2 h-6 w-6 sm:h-8 sm:w-8" />
                                Editar Participante
                            </DialogTitle>
                            <DialogDescription className="text-white/70 text-sm sm:text-base">
                                Modifique los datos del participante. Haga clic en guardar cuando termine.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid gap-3 sm:gap-4 py-2 sm:py-4"
                            >
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
                                {errors.name && <p className="text-red-500 text-xs sm:text-sm col-span-full">{errors.name}</p>}
                                
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
                                {errors.cedula && <p className="text-red-500 text-xs sm:text-sm col-span-full">{errors.cedula}</p>}
                                
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
                                        placeholder="Opcional (3 dígitos)"
                                        maxLength={3}
                                    />
                                </div>
                                {errors.ticketNumber && <p className="text-red-500 text-xs sm:text-sm col-span-full">{errors.ticketNumber}</p>}
                                
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
                                        id="active"
                                        checked={active}
                                        onCheckedChange={(checked) => setActive(checked as boolean)}
                                        className="bg-white/10 border-white/20"
                                    />
                                    <Label
                                        htmlFor="active"
                                        className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Participante activo
                                    </Label>
                                </div>
                            </motion.div>
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
                                    <Save className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    )
}

