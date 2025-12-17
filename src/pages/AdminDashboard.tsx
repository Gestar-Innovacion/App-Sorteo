import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Home, LogOut, Gift, Users, Trophy, Plus, Upload, List, Trash2, RefreshCw, X, Menu, ChevronsLeft, ChevronsRight, Maximize, Minimize, BarChart3, History, Volume2, VolumeX } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AddPrizeModal } from '@/components/AddPrizeModal'
import { EditPrizeModal } from '@/components/EditPrizeModal'
import UploadCSVModal from '@/components/UploadCSVModal'
import { UploadParticipantsCSVModal } from '@/components/UploadParticipantsCSVModal'
import { ViewListModal } from '@/components/ViewListModal'
import { Card, CardContent } from '@/components/ui/card'
import { DrawingModal } from '@/components/DrawingModal'
import { WinnerModal } from '@/components/WinnerModal'
import { DrawSection } from '@/components/DrawSection'
import { Prize, Participant, Winner } from '../types'
import { ResetWarningModal } from '@/components/ResetWarningModal'
import MinimalistLoader from '@/components/MinimalistLoader'
import { AddParticipantModal } from '@/components/AddParticipantModal'
import { EditParticipantModal } from '@/components/EditParticipantModal'
import { StatisticsDetailModal } from '@/components/StatisticsDetailModal'
import { StatisticsChart } from '@/components/StatisticsChart'
import { WinnerHistoryModal } from '@/components/WinnerHistoryModal'

import { request } from '@/services/index'
import { URL_PARTICIPANT, URL_PRIZE, URL_WINNER, URL_PRIZE_BULK, URL_WINNER_FULL, URL_WINNER_FILTER, URL_PARTICIPANTS_BULK, URL_CLEAN, URL_LOGOUT } from '@/constants/index'
import { StarryBackground } from '@/components/StarryBackground'
import '@/styles/fonts.css'

const AdminDashboard = () => {
    const [prizes, setPrizes] = useState<Prize[]>([])
    const [participants, setParticipants] = useState<Participant[]>([])
    const [winners, setWinners] = useState<Winner[]>([])
    const isLoadingWinnersRef = useRef(false)
    const isDrawingRef = useRef(false) // Prevenir múltiples sorteos simultáneos
    
    // Función helper para extraer número del ticket (maneja formatos como "T001", "321", etc.)
    const extractTicketNumber = (ticketNumber?: string): number | null => {
        if (!ticketNumber) return null
        // Extraer solo los dígitos del ticket_number
        const numbers = ticketNumber.replace(/\D/g, '')
        if (numbers === '') return null
        return parseInt(numbers, 10)
    }
    
    // Función para recargar ganadores desde la API
    const reloadWinners = async () => {
        // Prevenir llamadas duplicadas simultáneas
        if (isLoadingWinnersRef.current) {
            console.log('Ya hay una recarga de ganadores en progreso, omitiendo...')
            return
        }
        
        isLoadingWinnersRef.current = true
        try {
            const responseWinners = await request(URL_WINNER, 'GET')
            if (responseWinners.status_code === 200) {
                const winnersData = Array.isArray(responseWinners.data) ? responseWinners.data : []
                console.log('Ganadores recargados desde API:', winnersData)
                setWinners(winnersData)
                // Limpiar localStorage para mantener sincronización
                localStorage.removeItem('winners')
                return winnersData
            } else {
                console.error('Error al recargar ganadores:', responseWinners)
                setWinners([])
                localStorage.removeItem('winners')
                return []
            }
        } catch (err) {
            console.error('Error al recargar ganadores:', err)
            setWinners([])
            localStorage.removeItem('winners')
            return []
        } finally {
            isLoadingWinnersRef.current = false
        }
    }
    const [showAddPrizeModal, setShowAddPrizeModal] = useState(false)
    const [showEditPrizeModal, setShowEditPrizeModal] = useState(false)
    const [selectedPrizeToEdit, setSelectedPrizeToEdit] = useState<Prize | null>(null)
    const [showUploadCSVModal, setShowUploadCSVModal] = useState(false)
    const [showUploadParticipantsCSVModal, setShowUploadParticipantsCSVModal] = useState(false)
    const [showPrizeListModal, setShowPrizeListModal] = useState(false)
    const [showParticipantListModal, setShowParticipantListModal] = useState(false)
    const [showDrawingModal, setShowDrawingModal] = useState(false)
    const [winningTicketNumber, setWinningTicketNumber] = useState<number | undefined>(undefined)
    const [currentPrizeRange, setCurrentPrizeRange] = useState<{ start: number; end: number } | null>(null)
    const [showWinnerModal, setShowWinnerModal] = useState(false)
    const [currentWinner, setCurrentWinner] = useState<Winner | null>(null)
    const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true)
    const [areSidebarsVisible, setAreSidebarsVisible] = useState(true)
    const [showResetWarningModal, setShowResetWarningModal] = useState(false)
    const [showAddParticipantModal, setShowAddParticipantModal] = useState(false)
    const [showEditParticipantModal, setShowEditParticipantModal] = useState(false)
    const [selectedParticipantToEdit, setSelectedParticipantToEdit] = useState<Participant | null>(null)
    const navigate = useNavigate()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [isMobile, setIsMobile] = useState(false);
    const [showStatisticsModal, setShowStatisticsModal] = useState(false)
    const [statisticsModalTitle, setStatisticsModalTitle] = useState('')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showWinnerHistoryModal, setShowWinnerHistoryModal] = useState(false)
    const [isSoundMuted, setIsSoundMuted] = useState(false)
    const [showStatsPanel, setShowStatsPanel] = useState(false)
    const [statisticsModalItems, setStatisticsModalItems] = useState<(Prize | Participant)[]>([])
    const [statisticsModalType, setStatisticsModalType] = useState<'prizes' | 'participants'>('prizes')
    const hasLoadedRef = useRef(false)

    useEffect(() => {
        // Prevenir múltiples cargas simultáneas
        if (hasLoadedRef.current) return
        hasLoadedRef.current = true

        const loadData = async () => {
            try {
                // Limpiar localStorage de ganadores para evitar desincronización
                localStorage.removeItem('winners')
                
                const responseParticipants = await request(URL_PARTICIPANT, 'GET')
                if (responseParticipants.status_code === 200) {
                    setParticipants(responseParticipants.data || [])
                } else {
                    navigate('/')
                    return
                }

                const responsePrize = await request(URL_PRIZE, 'GET')
                if (responsePrize.status_code === 200) {
                    setPrizes(responsePrize.data || [])
                } else {
                    navigate('/')
                    return
                }

                const responseWinners = await request(URL_WINNER, 'GET')
                if (responseWinners.status_code === 200) {
                    // Asegurar que siempre sea un array
                    const winnersData = Array.isArray(responseWinners.data) ? responseWinners.data : []
                    console.log('Ganadores cargados desde API:', winnersData)
                    setWinners(winnersData)
                    
                    // Limpiar localStorage si la API está vacía pero localStorage tiene datos
                    if (winnersData.length === 0) {
                        localStorage.removeItem('winners')
                    }
                } else {
                    console.error('Error al cargar ganadores:', responseWinners)
                    setWinners([])
                    localStorage.removeItem('winners')
                    // No redirigir si solo falla la carga de ganadores
                }
            } catch (err) {
                console.error('Error al cargar los datos:', err)
                setError(true)
                setWinners([])
                localStorage.removeItem('winners')
                navigate('/')
            } finally {
                setLoading(false)
            }
        }

        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Funciones para pantalla completa
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true)
            }).catch(err => {
                console.error('Error al entrar en pantalla completa:', err)
            })
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false)
            }).catch(err => {
                console.error('Error al salir de pantalla completa:', err)
            })
        }
    }, [])

    // Escuchar cambios de pantalla completa
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    if (loading) {
        return (
            <MinimalistLoader
                text="Cargando"
                color="#3b82f6"
                blur={10}
            />
        )
    }

    if (error) {
        return <div>Error al cargar los datos. Redirigiendo...</div>
    }

    const handleAddPrize = async (newPrize: Omit<Prize, 'id_prize' | 'sorteado'>) => {
        // Solo enviar los campos necesarios, sin id_prize ni sorteado
        const prizeData = {
            name: newPrize.name,
            range_start: newPrize.range_start,
            range_end: newPrize.range_end
        }

        const responsePrize = await request(URL_PRIZE, "POST", prizeData)

        if (responsePrize.status_code === 200) {
            // Recargar lista desde la API para asegurar sincronización
            await reloadPrizes()
            toast({
                variant: "success",
                title: "Premio añadido",
                description: "El premio ha sido agregado exitosamente.",
            })
        }
    }

    const handleUploadCSV = async (newPrizes: { name: string; range_start: string; range_end: string; }[]) => {
        const result = await request(URL_PRIZE_BULK, "POST", { "prizes": newPrizes })

        if (result.status_code === 200) {
            const updatedPrizes = [...prizes, ...result.data]
            setPrizes(updatedPrizes)

            toast({
                variant: "success",
                title: "CSV cargado",
                description: `Se han agregado ${newPrizes.length} premios exitosamente.`,
            })
        }
    }

    const handleUploadParticipantsCSV = async (file: File) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').filter(row => row.trim() !== '');

            // Filtrar participantes con campos vacíos (name, cedula o ticket_number)
            // Ignorar la primera línea si es un header
            const dataRows = rows.filter((row, index) => {
                // Si la primera línea contiene "name" o "cedula", es un header y se ignora
                if (index === 0 && (row.toLowerCase().includes('name') || row.toLowerCase().includes('cedula'))) {
                    return false;
                }
                return true;
            });

            const newParticipants: Omit<Participant, 'id_participant'>[] = dataRows.map((row) => {
                const fields = row.split(';').map(field => field.trim());
                
                // Los campos mínimos requeridos son name (posición 0) y cedula (posición 1)
                const name = fields[0] || '';
                const cedula = fields[1] || '';
                
                // Los demás campos son opcionales y se asignan según su posición
                // Formato esperado: name;cedula;ticket_number;mesa
                // ticket_number puede estar vacío, pero si hay 4 campos, el 4to es mesa
                let ticket_number: string | undefined = undefined;
                let mesa: string | undefined = undefined;
                
                // Si hay un campo en posición 2, verificar si es ticket_number (3 dígitos) o mesa
                if (fields[2] && fields[2].length > 0) {
                    if (/^\d{3}$/.test(fields[2])) {
                        ticket_number = fields[2];
                        // Si hay un campo en posición 3, es mesa
                        if (fields[3] && fields[3].length > 0) {
                            mesa = fields[3];
                        }
                    } else {
                        // Si no es ticket_number, entonces es mesa
                        mesa = fields[2];
                        // Si hay un campo en posición 3, podría ser ticket_number
                        if (fields[3] && /^\d{3}$/.test(fields[3])) {
                            ticket_number = fields[3];
                        }
                    }
                } else if (fields[3] && fields[3].length > 0) {
                    // Si posición 2 está vacía pero posición 3 tiene contenido, es mesa
                    // (formato: name;cedula;;mesa)
                    mesa = fields[3];
                }

                // Validar si los campos requeridos están presentes
                if (name && cedula) {
                    return {
                        name,
                        cedula,
                        ticket_number: ticket_number || undefined,
                        mesa: mesa || undefined,
                        active: false
                    };
                }
                return null;
            }).filter(participant => participant !== null);

            const result = await request(URL_PARTICIPANTS_BULK, "POST", { "participants": newParticipants });


            if (result.status_code === 200) {
                const updatedParticipants = [...participants, ...result.data]
                setParticipants(updatedParticipants)

                toast({
                    variant: "success",
                    title: "CSV cargado",
                    description: `Se han agregado ${newParticipants.length} participantes exitosamente.`,
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Hubo un problema al cargar los participantes. Por favor, inténtelo de nuevo.",
                })
            }
        }
        reader.readAsText(file)
    }

    const handleDeletePrize = async (prizeId: number) => {
        const response = await request(URL_PRIZE, "DELETE", { id_prize: prizeId })
        if (response.status_code === 200) {
            const updatedPrizes = prizes.filter(prize => prize.id_prize !== prizeId)
            setPrizes(updatedPrizes)
            toast({
                variant: "success",
                title: "Premio eliminado",
                description: "El premio ha sido eliminado exitosamente.",
            })
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar el premio. Por favor, inténtelo de nuevo.",
            })
        }
    }

    // Función para recargar premios desde la API
    const reloadPrizes = async () => {
        try {
            const response = await request(URL_PRIZE, 'GET')
            if (response.status_code === 200) {
                setPrizes(response.data || [])
            }
        } catch (err) {
            console.error('Error al recargar premios:', err)
        }
    }

    const handleUpdatePrize = async (updatedPrize: Prize) => {
        try {
            const responsePrize = await request(URL_PRIZE, "PUT", {
                id_prize: updatedPrize.id_prize,
                name: updatedPrize.name,
                range_start: updatedPrize.range_start,
                range_end: updatedPrize.range_end,
                sorteado: updatedPrize.sorteado
            });

            if (responsePrize.status_code === 200) {
                // Recargar lista desde la API para asegurar sincronización
                await reloadPrizes()
                toast({
                    variant: "success",
                    title: "Premio actualizado",
                    description: "El premio ha sido actualizado exitosamente.",
                })
            } else {
                const errorMessage = responsePrize.data?.detail || "No se pudo actualizar el premio. Por favor, inténtelo de nuevo."
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: errorMessage,
                })
            }
        } catch (error) {
            console.error("Error al actualizar premio:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo.",
            })
        }
    }

    const handleEditPrize = (prize: Prize) => {
        setSelectedPrizeToEdit(prize)
        setShowEditPrizeModal(true)
    }

    const handleDeleteParticipant = async (participantId: number) => {
        const response = await request(URL_PARTICIPANT, "DELETE", { id_participant: participantId })
        if (response.status_code === 200) {
            const updatedParticipants = participants.filter(participant => participant.id_participant !== participantId)
            setParticipants(updatedParticipants)
            toast({
                variant: "success",
                title: "Participante eliminado",
                description: "El participante ha sido eliminado exitosamente.",
            })
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar el participante. Por favor, inténtelo de nuevo.",
            })
        }
    }

    const handleSelectPrize = async (prize: Prize) => {
        // Prevenir múltiples sorteos simultáneos
        if (isDrawingRef.current) {
            toast({
                title: "Sorteo en progreso",
                description: "Ya hay un sorteo en curso. Por favor, espera a que termine.",
                variant: "default",
            })
            return
        }

        // Validar que el premio no esté ya sorteado
        if (prize.sorteado) {
            toast({
                title: "Premio ya sorteado",
                description: `El premio "${prize.name}" ya ha sido sorteado.`,
                variant: "destructive",
            })
            return
        }

        // Filtrar participantes elegibles con validación mejorada
        const availableParticipants = participants.filter(p => {
            if (!p.ticket_number) return false
            const ticketNum = extractTicketNumber(p.ticket_number)
            if (ticketNum === null) return false
            return ticketNum >= prize.range_start && ticketNum <= prize.range_end
        })

        if (availableParticipants.length === 0) {
            toast({
                title: "No se puede realizar el sorteo",
                description: `No hay participantes elegibles en el rango ${prize.range_start} - ${prize.range_end} para el premio "${prize.name}".`,
                variant: "destructive",
            })
            return
        }

        // Marcar que hay un sorteo en progreso
        isDrawingRef.current = true
        
        // Validar nuevamente que hay participantes disponibles (por si cambió algo)
        const currentAvailableParticipants = participants.filter(p => {
            if (!p.ticket_number) return false
            const ticketNum = extractTicketNumber(p.ticket_number)
            if (ticketNum === null) return false
            return ticketNum >= prize.range_start && ticketNum <= prize.range_end
        })

        if (currentAvailableParticipants.length === 0) {
            toast({
                title: "Error",
                description: "No hay participantes disponibles. El sorteo fue cancelado.",
                variant: "destructive",
            })
            isDrawingRef.current = false
            return
        }

        // Seleccionar ganador aleatorio ANTES de mostrar el modal
        const randomParticipantIndex = Math.floor(Math.random() * currentAvailableParticipants.length)
        const selectedParticipant = currentAvailableParticipants[randomParticipantIndex]
        
        // Validar que el participante seleccionado sea válido
        if (!selectedParticipant || !selectedParticipant.id_participant) {
            toast({
                title: "Error",
                description: "Error al seleccionar el participante. Por favor, intenta de nuevo.",
                variant: "destructive",
            })
            isDrawingRef.current = false
            return
        }
        
        // Obtener el número del ticket del ganador para la animación
        const winningNumber = extractTicketNumber(selectedParticipant.ticket_number) || 0
        setWinningTicketNumber(winningNumber)
        
        // Guardar el rango del premio para la animación
        setCurrentPrizeRange({ start: prize.range_start, end: prize.range_end })
        
        // Guardar el participante y premio seleccionados para usarlos después (usar const para evitar problemas de scope)
        const savedParticipant = { ...selectedParticipant }
        const savedPrize = { ...prize }
        
        // Mostrar el modal con el número ganador
        setShowDrawingModal(true)

        // Esperar tiempo suficiente: animación (~2s) + tiempo mínimo que el número ganador se queda quieto (0.1s) = 2.1s
        setTimeout(() => {
            console.log('Timeout del sorteo completado - iniciando proceso de mostrar ganador')
            
            // Crear el objeto ganador INMEDIATAMENTE
            const newWinner: Winner = {
                id_winner: 0,
                id_prize: savedPrize.id_prize || 0,
                id_participant: savedParticipant.id_participant,
                participant_name: savedParticipant.name,
                ticket_number: savedParticipant.ticket_number || '',
                prize_name: savedPrize.name,
                drawdate: new Date().toISOString()
            }
            
            console.log('Ganador creado:', newWinner)
            console.log('Estado actual - showDrawingModal:', showDrawingModal, 'showWinnerModal:', showWinnerModal)
            
            // Cerrar el modal de sorteo y abrir el del ganador de forma síncrona
            setShowDrawingModal(false)
            setWinningTicketNumber(undefined)
            setCurrentPrizeRange(null)
            setCurrentWinner(newWinner)
            setShowWinnerModal(true)
            
            console.log('Estados actualizados - showDrawingModal: false, showWinnerModal: true, currentWinner:', newWinner)
            
            // Procesar las actualizaciones de API en segundo plano (sin bloquear)
            ;(async () => {
                try {
                    console.log('Iniciando registro de ganador en API:', {
                        prize: savedPrize,
                        participant: savedParticipant
                    })

                    // Registrar ganador en la API
                    const responseWinner = await request(URL_WINNER, 'POST', {
                        'id_prize': savedPrize.id_prize,
                        'id_participant': savedParticipant.id_participant,
                        'drawdate': new Date().toISOString(),
                    })

                    console.log('Respuesta de la API al registrar ganador:', responseWinner)

                    if (responseWinner.status_code === 200 && responseWinner.data) {
                        // Actualizar el ganador con los datos de la API
                        const updatedWinner: Winner = {
                            ...responseWinner.data,
                            participant_name: savedParticipant.name,
                            ticket_number: savedParticipant.ticket_number || '',
                            prize_name: savedPrize.name
                        }
                        // Asegurar que el ganador tenga todos los campos requeridos
                        if (!updatedWinner.participant_name) updatedWinner.participant_name = savedParticipant.name
                        if (!updatedWinner.ticket_number) updatedWinner.ticket_number = savedParticipant.ticket_number || ''
                        if (!updatedWinner.prize_name) updatedWinner.prize_name = savedPrize.name
                        
                        // Actualizar el ganador en el estado
                        setCurrentWinner(updatedWinner)
                        console.log('Ganador actualizado con datos de API:', updatedWinner)
                    }
                } catch (apiError) {
                    console.error('Error al registrar ganador en API (continuando con datos locales):', apiError)
                }

                // Recargar ganadores desde la API para asegurar sincronización (en segundo plano)
                reloadWinners().catch(err => console.error('Error al recargar ganadores:', err))

                // Actualizar premio y participante en la API (en segundo plano)
                Promise.all([
                    request(URL_PRIZE, "PUT", { 'id_prize': savedPrize.id_prize, 'sorteado': true }),
                    request(URL_PARTICIPANT, "PUT", { 'id_participant': savedParticipant.id_participant, 'active': false })
                ]).then(([requestUpdatePrizes, requestUpdateParticipants]) => {
                    if (requestUpdatePrizes.status_code === 200 && requestUpdateParticipants.status_code === 200) {
                        // Actualizar estados locales
                        setPrizes(prevPrizes => prevPrizes.map(p =>
                            p.id_prize === savedPrize.id_prize ? { ...p, sorteado: true } : p
                        ))

                        setParticipants(prevParticipants => prevParticipants.map(p =>
                            p.id_participant === savedParticipant.id_participant ? { ...p, active: false } : p
                        ))

                        toast({
                            title: "¡Sorteo realizado!",
                            description: `${savedParticipant.name} ha ganado ${savedPrize.name}`,
                            variant: "success",
                        })
                    } else {
                        console.error('Error al actualizar premio o participante:', { requestUpdatePrizes, requestUpdateParticipants })
                        toast({
                            title: "Advertencia",
                            description: "El ganador fue registrado, pero hubo un problema al actualizar el estado del premio o participante. Por favor, verifica manualmente.",
                            variant: "default",
                        })
                    }
                }).catch(err => {
                    console.error('Error al actualizar premio o participante:', err)
                })
            })().catch((err: unknown) => {
                console.error('Error inesperado en el proceso de API:', err)
            })
            
            // Siempre liberar el flag de sorteo en progreso
            isDrawingRef.current = false
        }, 2100) // ~2s animación + 0.1s que el número ganador se queda quieto
    }

    const handleNextPrize = () => {
        setShowWinnerModal(false)
        
        // Buscar el siguiente premio que no esté sorteado Y tenga participantes elegibles
        const nextPrize = prizes.find(p => {
            if (p.sorteado) return false
            
            // Verificar si hay participantes elegibles para este premio
            const eligibleParticipants = participants.filter(participant => {
                if (!participant.ticket_number) return false
                const ticketNum = extractTicketNumber(participant.ticket_number)
                if (ticketNum === null) return false
                return ticketNum >= p.range_start && ticketNum <= p.range_end
            })
            
            return eligibleParticipants.length > 0
        })
        
        if (nextPrize) {
            handleSelectPrize(nextPrize)
        } else {
            // Verificar si quedan premios sin sortear (aunque sin participantes)
            const remainingPrizes = prizes.filter(p => !p.sorteado)
            if (remainingPrizes.length > 0) {
                toast({
                    variant: "default",
                    title: "Sin participantes disponibles",
                    description: `Quedan ${remainingPrizes.length} premio(s) sin sortear, pero no hay participantes elegibles para ellos.`,
                })
        } else {
            toast({
                variant: "default",
                title: "Sorteo finalizado",
                description: "Todos los premios han sido sorteados.",
            })
            }
        }
    }

    const handleClearWinners = async () => {
        const responseResetWinners = await request(URL_WINNER_FULL, "DELETE")

        if (responseResetWinners.status_code === 200) {
            // Recargar ganadores desde la API para asegurar sincronización
            await reloadWinners()

            const restoredPrizes = prizes.map(prize => ({ ...prize, sorteado: false }))
            setPrizes(restoredPrizes)

            const restoredParticipants = participants.map(participant => ({ ...participant, active: true }))
            setParticipants(restoredParticipants)

            toast({
                variant: "success",
                title: "Historial de ganadores vaciado",
                description: "Se han restaurado los premios y participantes a su estado original.",
            })
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo vaciar el historial de ganadores. Por favor, inténtelo de nuevo.",
            })
        }
    }

    const handleDeleteWinner = async (winnerId: number) => {
        const winnerToDelete = winners.find(w => w.id_winner === winnerId)
        if (!winnerToDelete) return

        const responseDeleteWinner = await request(URL_WINNER_FILTER, "DELETE", {
            "id_winner": winnerId,
            "id_prize": winnerToDelete.id_prize,
            "id_participant": winnerToDelete.id_participant,
            "drawdate": winnerToDelete.drawdate || new Date().toISOString()
        })

        if (responseDeleteWinner.status_code === 200) {
            // Recargar ganadores desde la API para asegurar sincronización
            await reloadWinners()

            const updatedPrizes = prizes.map(prize =>
                prize.id_prize === winnerToDelete.id_prize ? { ...prize, sorteado: false } : prize
            )
            setPrizes(updatedPrizes)

            const updatedParticipants = participants.map(participant =>
                participant.id_participant === winnerToDelete.id_participant ? { ...participant, active: true } : participant
            )
            setParticipants(updatedParticipants)

            toast({
                variant: "success",
                title: "Ganador eliminado",
                description: "Se ha eliminado el ganador y restaurado el premio y participante asociados.",
            })
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar el ganador. Por favor, inténtelo de nuevo.",
            })
        }
    }

    const toggleLeftPanel = () => {
        setIsLeftPanelVisible(!isLeftPanelVisible)
    }

    const handleTotalReset = async (keyword: string) => {
        if (keyword === 'Reiniciar') {
            const responseDeleteAll = await request(URL_CLEAN, "DELETE")

            if (responseDeleteAll.status_code === 200) {
                setWinners([])
                setPrizes([])
                setParticipants([])

                setShowResetWarningModal(false)

                toast({
                    variant: "success",
                    title: "Reinicio completo",
                    description: "Todos los datos han sido eliminados exitosamente.",
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudo realizar el reinicio completo. Por favor, inténtelo de nuevo.",
                })
            }
        } else {
            toast({
                variant: "destructive",
                title: "Palabra clave incorrecta",
                description: 'La palabra clave correcta es "Reiniciar".',
            })
        }
    }

    // Función para recargar participantes desde la API
    const reloadParticipants = async () => {
        try {
            const response = await request(URL_PARTICIPANT, 'GET')
            if (response.status_code === 200) {
                setParticipants(response.data || [])
            }
        } catch (err) {
            console.error('Error al recargar participantes:', err)
        }
    }

    const handleAddParticipant = async (newParticipant: { name: string; cedula: string; ticket_number?: string; mesa?: string }) => {
        const participant = {
            ...newParticipant,
            active: true
        }

        try {
            const responseParticipant = await request(URL_PARTICIPANT, "POST", participant);

            if (responseParticipant.status_code === 200) {
                // Recargar lista desde la API para asegurar sincronización
                await reloadParticipants()
                toast({
                    variant: "success",
                    title: "Participante añadido",
                    description: "El participante ha sido agregado exitosamente.",
                })
                return { success: true, message: "Participante agregado con éxito" }
            } else {
                const errorMessage = responseParticipant.error ? "Error al agregar el participante" : "No se pudo agregar el participante. Por favor, inténtelo de nuevo."
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: errorMessage,
                })
                return { success: false, message: errorMessage }
            }
        } catch (error) {
            console.error("Error al agregar participante:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo.",
            })
            return { success: false, message: "Error inesperado al agregar el participante" }
        }
    }

    const handleUpdateParticipant = async (updatedParticipant: Participant) => {
        try {
            const responseParticipant = await request(URL_PARTICIPANT, "PUT", {
                id_participant: updatedParticipant.id_participant,
                name: updatedParticipant.name,
                cedula: updatedParticipant.cedula,
                ticket_number: updatedParticipant.ticket_number || '',
                mesa: updatedParticipant.mesa || '',
                active: updatedParticipant.active
            });

            if (responseParticipant.status_code === 200) {
                // Recargar lista desde la API para asegurar sincronización
                await reloadParticipants()
                toast({
                    variant: "success",
                    title: "Participante actualizado",
                    description: "El participante ha sido actualizado exitosamente.",
                })
                return { success: true, message: "Participante actualizado con éxito" }
            } else {
                const errorMessage = responseParticipant.data?.detail || "No se pudo actualizar el participante. Por favor, inténtelo de nuevo."
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: errorMessage,
                })
                return { success: false, message: errorMessage }
            }
        } catch (error) {
            console.error("Error al actualizar participante:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo.",
            })
            return { success: false, message: "Error inesperado al actualizar el participante" }
        }
    }

    const handleEditParticipant = (participant: Participant) => {
        setSelectedParticipantToEdit(participant)
        setShowEditParticipantModal(true)
    }

    const openStatisticsModal = (title: string, items: (Prize | Participant)[], type: 'prizes' | 'participants') => {
        setStatisticsModalTitle(title)
        setStatisticsModalItems(items)
        setStatisticsModalType(type)
        setShowStatisticsModal(true)
    }

    // Obtener participantes que realmente son ganadores (tienen ticket_number Y están en la API de winners)
    const getActualWinners = () => {
        if (winners.length === 0) return []
        const winnerParticipantIds = winners.map(w => w.id_participant)
        return participants.filter(p => p.ticket_number && winnerParticipantIds.includes(p.id_participant))
    }

    // Obtener participantes que son "Asistentes" (tienen ticket_number Y NO son ganadores)
    const getAttendees = () => {
        const winnerParticipantIds = winners.map(w => w.id_participant)
        return participants.filter(p => p.ticket_number && !winnerParticipantIds.includes(p.id_participant))
    }

    // Obtener participantes que son "No Asistentes" (NO tienen ticket_number)
    const getNonAttendees = () => {
        return participants.filter(p => !p.ticket_number)
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Fondo dinámico - optimizado */}
            <StarryBackground />

            <div className="relative z-10">
                <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
                    <div className="w-full px-4 py-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/90 rounded-2xl px-3 py-1.5">
                                <img src="/forza-logo.png" alt="Forza Logo" className="h-6 sm:h-8" />
                            </div>
                            <div className="bg-white/90 rounded-2xl px-3 py-1.5">
                                <img src="/gestar-logo.png" alt="Gestar Logo" className="h-6 sm:h-8" />
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                            {/* Botón para ocultar/mostrar paneles laterales */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAreSidebarsVisible(!areSidebarsVisible)}
                                className="text-white hover:bg-white/10 rounded-full p-2"
                                title={areSidebarsVisible ? "Ocultar paneles laterales" : "Mostrar paneles laterales"}
                            >
                                {areSidebarsVisible ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
                            </Button>
                            {isMobile && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleLeftPanel}
                                    className="text-white hover:bg-white/10 rounded-full p-2"
                                    title={isLeftPanelVisible ? "Ocultar panel" : "Mostrar panel"}
                                >
                                    {isLeftPanelVisible ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                                </Button>
                            )}
                            {/* Botón para silenciar/activar sonidos */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsSoundMuted(!isSoundMuted)}
                                className={`text-white hover:bg-white/10 rounded-full p-2 ${isSoundMuted ? 'text-red-400' : ''}`}
                                title={isSoundMuted ? "Activar sonidos" : "Silenciar sonidos"}
                            >
                                {isSoundMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                            {/* Botón para ver estadísticas */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowStatsPanel(!showStatsPanel)}
                                className={`text-white hover:bg-white/10 rounded-full p-2 ${showStatsPanel ? 'bg-white/20' : ''}`}
                                title="Estadísticas"
                            >
                                <BarChart3 className="h-4 w-4" />
                            </Button>
                            {/* Botón para ver historial de ganadores */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowWinnerHistoryModal(true)}
                                className="text-white hover:bg-white/10 rounded-full p-2"
                                title="Historial de ganadores"
                            >
                                <History className="h-4 w-4" />
                            </Button>
                            {/* Botón para pantalla completa */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleFullscreen}
                                className="text-white hover:bg-white/10 rounded-full p-2"
                                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                            >
                                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                            </Button>
                            <div className="hidden sm:block w-px h-6 bg-white/20 mx-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/')}
                                className="text-white hover:bg-white/10 rounded-full p-2"
                            >
                                <Home className="h-4 w-4" />
                                <span className="hidden md:inline ml-1 text-sm">Inicio</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                    try {
                                        const responseLogout = await request(URL_LOGOUT, "DELETE");
                                        if (responseLogout.status_code === 200) {
                                             navigate('/');
                                        }
                                    } catch (error) {
                                        console.error("Error al cerrar sesión:", error);
                                    }}
                                }
                                className="text-white hover:bg-white/10 rounded-full p-2"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden md:inline ml-1 text-sm">Salir</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowResetWarningModal(true)}
                                className="text-white hover:bg-white/10 rounded-full p-2"
                                title="Reiniciar todo"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Panel de estadísticas gráficas */}
                <AnimatePresence>
                    {showStatsPanel && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden border-b border-white/20"
                        >
                            <div className="w-full px-4 py-4 bg-white/5 backdrop-blur-lg">
                                <StatisticsChart 
                                    prizes={prizes}
                                    participants={participants}
                                    winners={winners}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <main className="w-full px-2 sm:px-4 py-4 sm:py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Left Sidebar */}
                        <AnimatePresence>
                            {((isLeftPanelVisible && areSidebarsVisible) || !isMobile && areSidebarsVisible) && (
                                <motion.div
                                    initial={{ opacity: 0, x: -300 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -300 }}
                                    transition={{ duration: 0.3 }}
                                    className={`${areSidebarsVisible ? 'lg:col-span-2' : 'hidden'} space-y-4`}
                                >
                                    {/* Prize Management */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-5"
                                    >
                                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                            <Gift className="mr-2 h-5 w-5" />
                                            Gestión de Premios
                                        </h2>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-3">
                                                <Button onClick={() => setShowAddPrizeModal(true)} className="w-full bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 hover:scale-105 text-sm sm:text-base py-2">
                                                    <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                    Agregar
                                                </Button>
                                                <Button onClick={() => setShowUploadCSVModal(true)} className="w-full bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center text-sm sm:text-base py-2">
                                                    <Upload className="h-4 w-4 mr-2 shrink-0" />
                                                    Cg CSV
                                                </Button>
                                                <Button onClick={() => {
                                                    setShowPrizeListModal(true)
                                                    toast({
                                                        variant: "default",
                                                        title: "Lista de premios",
                                                        description: "Mostrando todos los premios disponibles.",
                                                    })
                                                }} className="w-full bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 hover:scale-105 text-sm sm:text-base py-2">
                                                    <List className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                    Ver Lista
                                                </Button>
                                            </div>
                                            <div className="border border-white/20 rounded-2xl p-4 mt-4">
                                                <h3 className="text-lg font-semibold text-white mb-2">Estadísticas de Premios</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-center cursor-pointer" onClick={() => openStatisticsModal('Premios Disponibles', prizes.filter(p => !p.sorteado), 'prizes')}>
                                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-2">
                                                            <p className="text-2xl font-bold text-white">{prizes.filter(p => !p.sorteado).length}</p>
                                                        </div>
                                                        <p className="text-xs text-white/80">Premios disponibles</p>
                                                    </div>
                                                    <div className="text-center cursor-pointer" onClick={() => openStatisticsModal('Total de Premios', prizes, 'prizes')}>
                                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-2">
                                                            <p className="text-2xl font-bold text-white">{prizes.length}</p>
                                                        </div>
                                                        <p className="text-xs text-white/80">Total de premios</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Participant Management */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-5"
                                    >
                                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                            <Users className="mr-2 h-5 w-5" />
                                            Gestión de Participantes
                                        </h2>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-3">
                                                <Button onClick={() => setShowAddParticipantModal(true)} className="w-full bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 hover:scale-105 text-sm sm:text-base py-2">
                                                    <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                    Agregar
                                                </Button>
                                                <Button onClick={() => setShowUploadParticipantsCSVModal(true)} className="w-full bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 hover:scale-105 text-sm sm:text-base py-2">
                                                    <Upload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                    Cargar CSV
                                                </Button>
                                                <Button onClick={() => {
                                                    setShowParticipantListModal(true)
                                                    toast({
                                                        variant: "default",
                                                        title: "Lista de participantes",
                                                        description: "Mostrando todos los participantes registrados.",
                                                    })
                                                }} className="w-full bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 hover:scale-105 text-sm sm:text-base py-2">
                                                    <List className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                    Ver Lista
                                                </Button>
                                            </div>
                                            <div className="border border-white/20 rounded-2xl p-4 mt-4">
                                                <h3 className="text-lg font-semibold text-white mb-2">Estadísticas de Participantes</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-center cursor-pointer" onClick={() => openStatisticsModal('Total de Participantes', participants, 'participants')}>
                                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm mb-2">
                                                            <p className="text-xl font-bold text-white">{participants.length}</p>
                                                        </div>
                                                        <p className="text-xs text-white/80">Total</p>
                                                    </div>
                                                    <div className="text-center cursor-pointer" onClick={() => openStatisticsModal('Participantes Asistentes', getAttendees(), 'participants')}>
                                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm mb-2">
                                                            <p className="text-xl font-bold text-white">{getAttendees().length}</p>
                                                        </div>
                                                        <p className="text-xs text-white/80">
                                                            Asistentes</p>
                                                    </div>
                                                    <div className="text-center cursor-pointer" onClick={() => openStatisticsModal('Participantes Ganadores', getActualWinners(), 'participants')}>
                                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm mb-2">
                                                            <p className="text-xl font-bold text-white">{getActualWinners().length}</p>
                                                        </div>
                                                        <p className="text-xs text-white/80">Ganadores</p>
                                                    </div>
                                                    <div className="text-center cursor-pointer" onClick={() => openStatisticsModal('Participantes No Asistentes', getNonAttendees(), 'participants')}>
                                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm mb-2">
                                                            <p className="text-xl font-bold text-white">{getNonAttendees().length}</p>
                                                        </div>
                                                        <p className="text-xs text-white/80">No Asistentes</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className={`${areSidebarsVisible ? 'lg:col-span-8' : 'lg:col-span-12'} rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-3 sm:p-4 pt-3 sm:pt-4 flex flex-col items-center justify-start min-h-[500px] sm:min-h-[700px] overflow-y-auto`}
                        >
                            <DrawSection
                                prizes={prizes.filter(p => !p.sorteado)}
                                participants={participants}
                                onSelectPrize={handleSelectPrize}
                            />
                        </motion.div>

                        {/* Right Sidebar */}
                        {areSidebarsVisible && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 300 }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-3 sm:p-4 flex flex-col h-full"
                        >
                            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 flex-shrink-0">
                                <div className="flex items-center">
                                    <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="text-sm sm:text-base">Historial de Ganadores</span>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-300 hover:scale-105 p-2"
                                    onClick={handleClearWinners}
                                    title="Vaciar"
                                >
                                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                            </h2>
                            <div className="flex-1 overflow-y-auto scrollbar-hide">
                            {winners.length === 0 ? (
                                <p className="text-white/80 text-center py-8">
                                    No hay ganadores registrados
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {winners.map((winner) => (
                                        <Card key={winner.id_winner} className="bg-white/5 border-white/10 rounded-2xl overflow-hidden">
                                            <CardContent className="p-3 sm:p-4 flex justify-between items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-white text-sm sm:text-base break-words">{winner.participant_name}</p>
                                                    <p className="text-white/80 text-xs sm:text-sm mt-1 break-words">Premio: {winner.prize_name}</p>
                                                    <p className="text-white/60 text-xs mt-1">Fecha: {new Date(winner.drawdate).toLocaleDateString()}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteWinner(winner.id_winner ? winner.id_winner : 0)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 shrink-0 ml-2"
                                                >
                                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                            </div>
                        </motion.div>
                        )}
                    </div>
                </main>
            </div>

            <AddPrizeModal
                isOpen={showAddPrizeModal}
                onOpenChange={setShowAddPrizeModal}
                onAddSuccess={handleAddPrize}
            />
            <EditPrizeModal
                isOpen={showEditPrizeModal}
                onOpenChange={setShowEditPrizeModal}
                prize={selectedPrizeToEdit}
                onEditPrize={handleUpdatePrize}
            />

            <UploadCSVModal
                isOpen={showUploadCSVModal}
                onOpenChange={setShowUploadCSVModal}
                onUploadCSV={handleUploadCSV}
            />

            <UploadParticipantsCSVModal
                isOpen={showUploadParticipantsCSVModal}
                onOpenChange={setShowUploadParticipantsCSVModal}
                onUploadSuccess={handleUploadParticipantsCSV}
            />

            <ViewListModal
                isOpen={showPrizeListModal}
                onOpenChange={setShowPrizeListModal}
                items={prizes}
                type="prizes"
                onDelete={handleDeletePrize}
                onEditPrize={handleEditPrize}
            />

            <ViewListModal
                isOpen={showParticipantListModal}
                onOpenChange={setShowParticipantListModal}
                items={participants}
                type="participants"
                onDelete={handleDeleteParticipant}
                onEditParticipant={handleEditParticipant}
                winners={winners}
            />

            <DrawingModal
                isOpen={showDrawingModal}
                onOpenChange={(open) => {
                    // Prevenir que el usuario cierre el modal manualmente durante el sorteo
                    if (!open && isDrawingRef.current) {
                        console.log('Intento de cerrar modal de sorteo durante el sorteo - bloqueado')
                        return
                    }
                    setShowDrawingModal(open)
                }}
                winningNumber={winningTicketNumber}
                rangeStart={currentPrizeRange?.start}
                rangeEnd={currentPrizeRange?.end}
                isMuted={isSoundMuted}
            />

            <WinnerModal
                isOpen={showWinnerModal && !!currentWinner}
                onOpenChange={(open) => {
                    console.log('WinnerModal onOpenChange llamado con:', open, 'currentWinner:', currentWinner)
                    setShowWinnerModal(open)
                    if (!open) {
                        setCurrentWinner(null)
                    }
                }}
                winner={currentWinner}
                onNextPrize={handleNextPrize}
                isMuted={isSoundMuted}
            />
            <ResetWarningModal
                isOpen={showResetWarningModal}
                onOpenChange={setShowResetWarningModal}
                onConfirmReset={handleTotalReset}
            />
            <AddParticipantModal
                isOpen={showAddParticipantModal}
                onOpenChange={setShowAddParticipantModal}
                onAddParticipant={handleAddParticipant}
                existingParticipants={participants}
            />
            <EditParticipantModal
                isOpen={showEditParticipantModal}
                onOpenChange={setShowEditParticipantModal}
                participant={selectedParticipantToEdit}
                onUpdateParticipant={handleUpdateParticipant}
                existingParticipants={participants}
            />
            <StatisticsDetailModal
                isOpen={showStatisticsModal}
                onOpenChange={setShowStatisticsModal}
                title={statisticsModalTitle}
                items={statisticsModalItems}
                type={statisticsModalType}
                winners={winners}
            />

            {/* Modal de historial de ganadores con filtros */}
            <WinnerHistoryModal
                isOpen={showWinnerHistoryModal}
                onOpenChange={setShowWinnerHistoryModal}
                winners={winners}
            />
        </div>
    )
}

export default AdminDashboard

