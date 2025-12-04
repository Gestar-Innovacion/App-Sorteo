import { AlertCircle, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onUploadCSV: (newPrizes: { name: string; range_start: string; range_end: string; }[]) => void;
}

const validateCSVContent = (content: string): { isValid: boolean; error: string | null } => {
    const rows = content.split('\n').filter(row => row.trim() !== '')

    for (let i = 0; i < rows.length; i++) {
        const [name, range_start, range_end] = rows[i].split(';').map(field => field.trim())

        // Verificar que todos los campos estén presentes
        if (!name || !range_start || !range_end) {
            return { isValid: false, error: `Fila ${i + 1}: Faltan campos. Asegúrese de incluir nombre, rango inicial y rango final.` }
        }

        // Verificar que los rangos sean cadenas de 3 dígitos
        if (!/^\d{3}$/.test(range_start) || !/^\d{3}$/.test(range_end)) {
            return { isValid: false, error: `Fila ${i + 1}: Los rangos deben ser números de 3 dígitos (ej: 001, 022, 100).` }
        }

        const start = parseInt(range_start)
        const end = parseInt(range_end)

        // Verificar que el rango esté entre 001 y 500
        if (start < 1 || end > 500) {
            return { isValid: false, error: `Fila ${i + 1}: Los rangos deben estar entre 001 y 500.` }
        }

        // Verificar que el número mínimo no sea mayor que el máximo
        if (start > end) {
            return { isValid: false, error: `Fila ${i + 1}: El rango inicial no puede ser mayor que el rango final.` }
        }
    }

    return { isValid: true, error: null }
}

const UploadCSVModal = ({ isOpen, onOpenChange, onUploadCSV }: Props) => {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0]
        if (selectedFile?.type !== 'text/csv' && !selectedFile?.name.endsWith('.csv')) {
            setError('Por favor, seleccione un archivo CSV válido')
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result as string
            const { isValid, error } = validateCSVContent(text)

            if (isValid) {
                setFile(selectedFile)
                setError(null)
            } else {
                setError(error || 'El archivo contiene datos inválidos.')
            }
        }
        reader.readAsText(selectedFile)
    }, [setFile, setError])

    const handleUpload = () => {
        if (file) {
            const reader = new FileReader()
            reader.onload = async (e) => {
                const text = e.target?.result as string
                const { isValid, error } = validateCSVContent(text)

                if (isValid) {
                    const rows = text.split('\n').filter(row => row.trim() !== '')
                    const newPrizes = rows.map((row) => {
                        const [name, range_start, range_end] = row.split(';').map(field => field.trim())
                        return {
                            name,
                            range_start,
                            range_end,
                        }
                    })

                    try {
                        await onUploadCSV(newPrizes)
                        setFile(null)
                        setError(null)
                        onOpenChange(false)
                        toast({
                            title: "Éxito",
                            description: `Se han cargado ${newPrizes.length} premios correctamente.`,
                        })
                    } catch (error) {
                        console.error('Error al cargar los premios:', error)
                        setError('Hubo un problema al cargar los premios. Por favor, inténtelo de nuevo.')
                        toast({
                            title: "Error",
                            description: "No se pudieron cargar los premios. Por favor, inténtelo de nuevo.",
                            variant: "destructive",
                        })
                    }
                } else {
                    setError(error || 'El archivo contiene datos inválidos.')
                }
            }
            reader.readAsText(file)
        } else {
            setError('Por favor, seleccione un archivo antes de cargar.')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-full bg-gradient-to-br from-slate-800 via-teal-900 to-cyan-900 text-white rounded-3xl border-2 border-white/20 shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-center text-white">
                        Cargar Premios CSV
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="bg-white/10 p-6 rounded-2xl space-y-4">
                        <h3 className="font-semibold text-xl flex items-center gap-2">
                            <AlertCircle className="h-7 w-7 text-yellow-300" />
                            Formato Requerido
                        </h3>
                        <p className="text-sm text-white/80">
                            El archivo CSV debe contener los campos separados por punto y coma (;):
                        </p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <code className="block bg-black/30 p-4 rounded-xl text-sm text-white/90 font-mono">
                                PREMIO 1;001;050
                                PREMIO 2;030;100
                            </code>
                        </motion.div>
                        <p className="text-sm text-white/80">
                            Los rangos deben ser números de 3 dígitos entre 001 y 500. Los rangos pueden superponerse.
                        </p>
                        <motion.a
                            href="/plantillas/plantilla_premios.csv"
                            download="plantilla_premios.csv"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all duration-300"
                        >
                            <Download className="h-4 w-4" />
                            Descargar Plantilla
                        </motion.a>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <label
                            htmlFor="csvFile"
                            className="block w-full p-4 border-2 border-dashed border-white/30 rounded-2xl cursor-pointer hover:bg-white/10 transition-all duration-300"
                        >
                            <input
                                type="file"
                                id="csvFile"
                                accept=".csv"
                                onChange={(e) => onDrop(e.target.files ? [e.target.files[0]] : [])}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="h-10 w-10 text-blue-300" />
                                <span className="text-sm font-medium text-white/80">
                                    {file ? file.name : "Haz clic para seleccionar un archivo CSV"}
                                </span>
                            </div>
                        </label>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleUpload}
                            disabled={!file}
                        >
                            Cargar CSV
                        </motion.button>
                    </motion.div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-sm mt-2"
                        >
                            {error}
                        </motion.p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default UploadCSVModal;

