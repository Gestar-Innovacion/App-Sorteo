import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Upload, AlertCircle, FileText, X, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface UploadParticipantsCSVModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onUploadSuccess: (file: File) => void
}

export function UploadParticipantsCSVModal({ isOpen, onOpenChange, onUploadSuccess }: UploadParticipantsCSVModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading] = useState(false)
    const { toast } = useToast()

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile && selectedFile.type === "text/csv") {
            setFile(selectedFile)
        } else {
            toast({
                title: "Error",
                description: "Por favor, selecciona un archivo CSV válido.",
                variant: "destructive",
            })
            setFile(null)
        }
    }

    const handleUpload = () => {
        if (!file) {
            toast({
                title: "Error",
                description: "Por favor, selecciona un archivo CSV antes de cargar.",
                variant: "destructive",
            })
            return
        }

        onUploadSuccess(file)
        onOpenChange(false)
        setFile(null)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-full bg-gradient-to-br from-teal-700 to-blue-900 text-white rounded-3xl border-2 border-white/20 shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-center text-white">
                        Cargar Participantes CSV
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                    >
                        <Input
                            id="csvFile"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="csvFile"
                            className="flex items-center justify-center w-full p-8 bg-white/10 border-2 border-dashed border-white/30 rounded-2xl cursor-pointer hover:bg-white/20 transition-all duration-300"
                        >
                            <div className="flex flex-col items-center">
                                <FileText className="w-20 h-20 mb-4 text-blue-300" />
                                <span className="text-lg font-medium">
                                    {file ? file.name : "Selecciona un archivo CSV"}
                                </span>
                            </div>
                        </label>
                        <AnimatePresence>
                            {file && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-300"
                                    onClick={() => setFile(null)}
                                >
                                    <X className="w-4 h-4 text-white" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            onClick={handleUpload}
                            className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!file || uploading}
                        >
                            {uploading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Cargando...
                                </span>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-5 w-5" />
                                    Cargar Participantes
                                </>
                            )}
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-white/80 bg-white/10 p-6 rounded-2xl"
                    >
                        <div className="flex items-start gap-4">
                            <AlertCircle className="h-7 w-7 mt-1 flex-shrink-0 text-yellow-300" />
                            <p>
                                El archivo CSV debe estar delimitado por punto y coma (;) y contener las columnas en el siguiente orden: <span className="font-semibold">name</span>, <span className="font-semibold">cedula</span>, <span className="font-semibold">ticket_number</span>.
                                Los campos 'active' y 'asistencia' se establecerán automáticamente.
                            </p>
                        </div>
                        <motion.a
                            href="/plantillas/plantilla_participantes.csv"
                            download="plantilla_participantes.csv"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all duration-300"
                        >
                            <Download className="h-4 w-4" />
                            Descargar Plantilla
                        </motion.a>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

