'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { Lock, ChevronDown, Eye, EyeOff, Search, Sparkles } from 'lucide-react'
import { HibiscusFlower } from '@/components/HibiscusFlower'
import { Checkbox } from "@/components/ui/checkbox"

import { request } from '@/services/index'
import { URL_LOGIN } from '@/constants/index'
import { AuroraBorealis } from '@/components/AuroraBorealis'
import { SnowEffect } from '@/components/SnowEffect'
import { Countdown } from '@/components/Countdown'
import { StylizedClock } from '@/components/StylizedClock'
import { ParticleEffect } from '@/components/ParticleEffect'
import { LookupModal } from '@/components/LookupModal'

import '@/styles/fonts.css'

// Datos estáticos memoizados fuera del componente para evitar re-creación
const STAR_POSITIONS = [
    { left: '10%', top: '5%' },
    { left: '22%', top: '35%' },
    { left: '34%', top: '5%' },
    { left: '46%', top: '35%' },
    { left: '58%', top: '5%' },
    { left: '70%', top: '35%' },
    { left: '82%', top: '5%' },
    { left: '94%', top: '35%' },
]

const HIBISCUS_DATA = [
    { position: { left: '3%', top: '10%' }, color: 'text-pink-400/50', delay: 0 },
    { position: { left: '92%', top: '15%' }, color: 'text-red-400/50', delay: 0.5 },
    { position: { left: '5%', top: '80%' }, color: 'text-orange-400/50', delay: 1 },
    { position: { left: '90%', top: '85%' }, color: 'text-yellow-400/50', delay: 1.5 },
]

const PARTICLE_DATA = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    width: 4 + Math.random() * 4,
    colorClass: i % 4 === 0 ? 'bg-cyan-300/40' :
                i % 4 === 1 ? 'bg-orange-300/40' :
                i % 4 === 2 ? 'bg-yellow-300/40' : 'bg-green-300/40',
    yOffset: Math.random() * 20 - 10,
    duration: 3 + Math.random() * 2,
    delay: Math.random() * 2,
}))

// Componentes memoizados
const DecorativeStar = memo(({ index, position }: { index: number; position: { left: string; top: string } }) => (
    <motion.div
        className="absolute"
        style={position}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
            opacity: [0.2, 0.8, 0.2],
            scale: [0.5, 1.3, 0.5],
            rotate: [0, 180, 360]
        }}
        transition={{
            duration: 4 + index * 0.3,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
        }}
    >
        <Sparkles className="w-5 h-5 md:w-7 md:h-7 text-yellow-300/50" />
    </motion.div>
))
DecorativeStar.displayName = 'DecorativeStar'

const DecorativeHibiscus = memo(({ data, index }: { data: typeof HIBISCUS_DATA[0]; index: number }) => (
    <motion.div
        className="absolute"
        style={data.position}
        initial={{ opacity: 0, scale: 0, rotate: -45 }}
        animate={{ 
            opacity: [0.4, 0.7, 0.4],
            scale: [0.9, 1.2, 0.9],
            rotate: [-45, 0, 45, 0, -45]
        }}
        transition={{
            duration: 5 + index,
            repeat: Infinity,
            delay: data.delay,
            ease: "easeInOut"
        }}
    >
        <HibiscusFlower className={`w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 ${data.color}`} size={128} />
    </motion.div>
))
DecorativeHibiscus.displayName = 'DecorativeHibiscus'

const FloatingParticle = memo(({ data }: { data: typeof PARTICLE_DATA[0] }) => (
    <motion.div
        className="absolute rounded-full"
        style={{
            left: `${data.left}%`,
            top: `${data.top}%`,
            width: `${data.width}px`,
            height: `${data.width}px`,
        }}
        animate={{
            y: [0, -30, 0],
            x: [0, data.yOffset, 0],
            opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
            duration: data.duration,
            repeat: Infinity,
            delay: data.delay,
            ease: "easeInOut"
        }}
    >
        <div className={`w-full h-full rounded-full ${data.colorClass}`} />
    </motion.div>
))
FloatingParticle.displayName = 'FloatingParticle'

const AlohaTitle = memo(() => (
    <motion.h1 
        className="text-8xl md:text-[12rem] lg:text-[15rem] font-normal block mb-8 md:mb-12 relative z-10"
        style={{
            fontFamily: "'Dancing Script', cursive",
            background: 'linear-gradient(90deg, #22d3ee, #fb923c, #fde047, #4ade80, #22d3ee)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '1.1',
            fontWeight: 700,
            filter: 'drop-shadow(0 0 30px rgba(34,211,238,0.6)) drop-shadow(0 0 60px rgba(251,146,60,0.5)) drop-shadow(0 0 90px rgba(253,224,71,0.4))',
        }}
        animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
        }}
    >
        Aloha
    </motion.h1>
))
AlohaTitle.displayName = 'AlohaTitle'

const HomePage = () => {
    const [showLogin, setShowLogin] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [showLookupModal, setShowLookupModal] = useState(false)
    const navigate = useNavigate()
    const { toast } = useToast()

    // 20 de diciembre 2025, sábado, 3 PM
    const eventDate = useMemo(() => new Date(2025, 11, 20, 15, 0, 0), [])

    useEffect(() => {
        const savedCredentials = localStorage.getItem('loginCredentials')
        if (savedCredentials) {
            const { username, password } = JSON.parse(savedCredentials)
            setUsername(username)
            setPassword(password)
            setRememberMe(true)
        }
    }, [])

    const handleLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        const loginData = {
            grant_type: 'password',
            username: username,
            password: password,
            scope: '',
            client_id: 'string',
            client_secret: 'string'
        }

        const response = await request(
            URL_LOGIN,
            'POST',
            loginData,
            'application/x-www-form-urlencoded'
        )

        if (response.status_code === 200) {
            if (rememberMe) {
                localStorage.setItem('loginCredentials', JSON.stringify({ username, password }))
            } else {
                localStorage.removeItem('loginCredentials')
            }
            toast({
                title: "¡Bienvenido!",
                description: "Has iniciado sesión exitosamente.",
            })
            navigate("/admin")
        } else {
            toast({
                title: "Error de autenticación",
                description: response.data.detail || "Usuario o contraseña incorrectos.",
                variant: "destructive",
            })
        }
    }, [username, password, rememberMe, navigate, toast])

    const handleShowLogin = useCallback(() => setShowLogin(true), [])
    const handleHideLogin = useCallback(() => setShowLogin(false), [])
    const handleShowLookupModal = useCallback(() => setShowLookupModal(true), [])
    const handleTogglePassword = useCallback(() => setShowPassword(prev => !prev), [])

    return (
        <div className="relative min-h-screen overflow-hidden">
            <AuroraBorealis />
            <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[1]"></div>
            <SnowEffect />
            <ParticleEffect />

            <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
                <motion.div
                    className="w-full max-w-5xl"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <motion.div
                        className="mb-4 md:mb-8 text-center"
                    >
                        <motion.div
                            className="text-center mb-8 md:mb-12 relative pt-8 md:pt-16"
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            {/* Estrellas decorativas sutiles - memoizadas */}
                            {STAR_POSITIONS.map((position, i) => (
                                <DecorativeStar key={`star-${i}`} index={i} position={position} />
                            ))}
                            
                            {/* Flores de hibisco decorativas - memoizadas */}
                            {HIBISCUS_DATA.map((data, i) => (
                                <DecorativeHibiscus key={`hibiscus-${i}`} data={data} index={i} />
                            ))}
                            
                            {/* Partículas flotantes hawaianas - memoizadas */}
                            {PARTICLE_DATA.map((data) => (
                                <FloatingParticle key={`particle-${data.id}`} data={data} />
                            ))}
                            
                            <AlohaTitle />
                            <motion.h2
                                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white relative z-10 mt-8 md:mt-12"
                                style={{
                                    fontFamily: "'Great Vibes', cursive",
                                    textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3), 0 0 30px rgba(255,255,255,0.2)',
                                }}
                            >
                                Fiesta de Fin de Año Temática de Hawái
                            </motion.h2>
                        </motion.div>
                    </motion.div>

                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-0">
                        <motion.div
                            className="w-full md:w-1/2 md:pr-8"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="mb-8">
                                <StylizedClock date={eventDate} />
                            </div>
                            <Countdown targetDate={eventDate} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="w-full md:w-2/5"
                        >
                            <div className="rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 md:p-6 shadow-2xl">
                                <div className="mb-6 md:mb-8 flex justify-center space-x-4">
                                    <motion.img
                                        src="/forza-logo.png"
                                        alt="Forza Logo"
                                        className="h-10 md:h-12 brightness-200 contrast-200"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                    />
                                    <motion.img
                                        src="/gestar-logo.png"
                                        alt="Gestar Logo"
                                        className="h-10 md:h-12 brightness-200 contrast-200"
                                        whileHover={{ scale: 1.1, rotate: -5 }}
                                        whileTap={{ scale: 0.9 }}
                                    />
                                </div>

                                <AnimatePresence mode="wait">
                                    {!showLogin ? (
                                        <motion.div
                                            key="buttons"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-4"
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    onClick={handleShowLogin}
                                                    variant="outline"
                                                    className="w-full border-white/10 text-white hover:bg-white/10 py-4 md:py-5 text-sm md:text-base rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                                >
                                                    <Lock className="mr-2 h-4 w-4" />
                                                    Administrador
                                                </Button>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    onClick={handleShowLookupModal}
                                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 md:py-5 text-sm md:text-base rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                                >
                                                    <Search className="mr-2 h-4 w-4" />
                                                    Registrar Numero de Sorteo
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    ) : (
                                        <motion.form
                                            key="login"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            onSubmit={handleLogin}
                                            className="space-y-4"
                                        >
                                            <Input
                                                type="text"
                                                placeholder="Usuario"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="bg-white/10 border-white/10 text-white placeholder:text-white/50 rounded-xl py-4 md:py-5"
                                            />
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Contraseña"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="bg-white/10 border-white/10 text-white placeholder:text-white/50 rounded-xl py-4 md:py-5 pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleTogglePassword}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="rememberMe"
                                                    checked={rememberMe}
                                                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                                />
                                                <label
                                                    htmlFor="rememberMe"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
                                                >
                                                    Recordar credenciales
                                                </label>
                                            </div>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    type="submit"
                                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 md:py-5 text-sm md:text-base rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                                >
                                                    Iniciar sesión
                                                </Button>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={handleHideLogin}
                                                    className="w-full text-white hover:bg-white/10 py-4 md:py-5 text-sm md:text-base rounded-xl transition-all duration-300"
                                                >
                                                    Volver al inicio
                                                </Button>
                                            </motion.div>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            <motion.div
                className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 text-white/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
            >
                <ChevronDown className="animate-bounce" />
            </motion.div>

            <LookupModal isOpen={showLookupModal} onOpenChange={setShowLookupModal} />
        </div>
    )
}

export default memo(HomePage)
