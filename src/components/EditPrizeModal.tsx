import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Gift, Save } from 'lucide-react'
import { Prize } from '../types';

// interface Prize {
//   id_prize: number;
//   name: string;
//   range_start: number;
//   range_end: number;
//   sorteado: boolean;
// }

interface EditPrizeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    prize: Prize | null;
    onEditPrize: (prize: Prize) => Promise<void>;
}

export function EditPrizeModal({ isOpen, onOpenChange, prize, onEditPrize }: EditPrizeModalProps) {
    const [editedPrize, setEditedPrize] = useState<Prize | null>(null)

    useEffect(() => {
        if (prize) {
            setEditedPrize({ ...prize })
        }
    }, [prize])

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSave = async () => {
        if (!editedPrize) return

        // Validar que el rango inicial sea menor o igual al final
        if (editedPrize.range_start > editedPrize.range_end) {
            alert('El rango inicial no puede ser mayor al rango final')
            return
        }
        
        // Validar que el nombre no esté vacío
        if (!editedPrize.name.trim()) {
            alert('El nombre del premio es requerido')
            return
        }

        // Validar que los rangos sean números válidos
        if (isNaN(editedPrize.range_start) || isNaN(editedPrize.range_end)) {
            alert('Los rangos deben ser números válidos')
            return
        }

        setIsSubmitting(true)
        try {
            await onEditPrize(editedPrize)
            onOpenChange(false)
        } catch (error) {
            console.error('Error al guardar premio:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!editedPrize) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog open={isOpen} onOpenChange={onOpenChange}>
                    <DialogContent className="bg-gradient-to-br from-teal-700 to-blue-900 text-white sm:max-w-[425px] rounded-3xl border-2 border-white/20 shadow-xl">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-bold text-center flex items-center justify-center text-white">
                                <Gift className="mr-2 h-8 w-8" />
                                Editar Premio
                            </DialogTitle>
                        </DialogHeader>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid gap-6 py-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-lg font-semibold text-white">
                                    Nombre del Premio
                                </Label>
                                <Input
                                    id="name"
                                    value={editedPrize.name}
                                    onChange={(e) => setEditedPrize({ ...editedPrize, name: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="range_start" className="text-lg font-semibold text-white">
                                    Rango Inicial
                                </Label>
                                <Input
                                    id="range_start"
                                    type="number"
                                    value={editedPrize.range_start}
                                    onChange={(e) => setEditedPrize({ ...editedPrize, range_start: parseInt(e.target.value) })}
                                    className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="range_end" className="text-lg font-semibold text-white">
                                    Rango Final
                                </Label>
                                <Input
                                    id="range_end"
                                    type="number"
                                    value={editedPrize.range_end}
                                    onChange={(e) => setEditedPrize({ ...editedPrize, range_end: parseInt(e.target.value) })}
                                    className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                                />
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Button 
                                onClick={handleSave} 
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white transition-colors duration-200 rounded-xl disabled:opacity-50"
                            >
                                <Save className="mr-2 h-5 w-5" />
                                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    )
}

