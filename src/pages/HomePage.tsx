'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
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
import { LookupModal } from '@/components/LookupModal'

import '@/styles/fonts.css'

// Datos estáticos
const STAR_POSITIONS = [
    { left: '10%', top: '5%', delay: '0s' },
    { left: '22%', top: '35%', delay: '0.3s' },
    { left: '34%', top: '5%', delay: '0.6s' },
    { left: '46%', top: '35%', delay: '0.9s' },
    { left: '58%', top: '5%', delay: '1.2s' },
    { left: '70%', top: '35%', delay: '1.5s' },
    { left: '82%', top: '5%', delay: '1.8s' },
    { left: '94%', top: '35%', delay: '2.1s' },
]

const HIBISCUS_DATA = [
    { left: '3%', top: '10%', color: 'text-pink-400/50', delay: '0s' },
    { left: '92%', top: '15%', color: 'text-red-400/50', delay: '0.5s' },
    { left: '5%', top: '80%', color: 'text-orange-400/50', delay: '1s' },
    { left: '90%', top: '85%', color: 'text-yellow-400/50', delay: '1.5s' },
]

// Componentes con CSS puro (sin Framer Motion)
const DecorativeStars = memo(() => (
    <>
        {STAR_POSITIONS.map((pos, i) => (
            <div
                key={`star-${i}`}
                className="absolute animate-star-pulse"
                style={{ left: pos.left, top: pos.top, animationDelay: pos.delay }}
            >
                <Sparkles className="w-5 h-5 md:w-7 md:h-7 text-yellow-300/50" />
            </div>
        ))}
    </>
))
DecorativeStars.displayName = 'DecorativeStars'

const DecorativeHibiscus = memo(() => (
    <>
        {HIBISCUS_DATA.map((data, i) => (
            <div
                key={`hibiscus-${i}`}
                className={`absolute animate-hibiscus ${data.color}`}
                style={{ left: data.left, top: data.top, animationDelay: data.delay }}
            >
                <HibiscusFlower className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32" size={128} />
            </div>
        ))}
    </>
))
DecorativeHibiscus.displayName = 'DecorativeHibiscus'

const HomePage = () => {
    const [showLogin, setShowLogin] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [showLookupModal, setShowLookupModal] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const navigate = useNavigate()
    const { toast } = useToast()

    const eventDate = useMemo(() => new Date(2025, 11, 20, 15, 0, 0), [])

    useEffect(() => {
        // Marcar como cargado después de un pequeño delay para la animación inicial
        const timer = setTimeout(() => setIsLoaded(true), 100)
        return () => clearTimeout(timer)
    }, [])

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

    return (
        <div className="relative min-h-screen overflow-hidden">
            <AuroraBorealis />
            <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[1]"></div>
            <SnowEffect />

            <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
                <div className={`w-full max-w-5xl transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="mb-4 md:mb-8 text-center">
                        <div className="text-center mb-8 md:mb-12 relative pt-8 md:pt-16">
                            <DecorativeStars />
                            <DecorativeHibiscus />
                            
                            <h1 
                                className="text-8xl md:text-[12rem] lg:text-[15rem] font-normal block mb-8 md:mb-12 relative z-10 animate-gradient-text"
                                style={{
                                    fontFamily: "'Dancing Script', cursive",
                                    background: 'linear-gradient(90deg, #22d3ee, #fb923c, #fde047, #4ade80, #22d3ee)',
                                    backgroundSize: '200% 100%',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    lineHeight: '1.1',
                                    fontWeight: 700,
                                    filter: 'drop-shadow(0 0 30px rgba(34,211,238,0.6)) drop-shadow(0 0 60px rgba(251,146,60,0.5))',
                                }}
                            >
                                Aloha
                            </h1>
                            <h2
                                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white relative z-10 mt-8 md:mt-12"
                                style={{
                                    fontFamily: "'Great Vibes', cursive",
                                    textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)',
                                }}
                            >
                                Fiesta de Fin de Año Temática de Hawái
                            </h2>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-0">
                        <div className={`w-full md:w-1/2 md:pr-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                            <div className="mb-8">
                                <StylizedClock date={eventDate} />
                            </div>
                            <Countdown targetDate={eventDate} />
                        </div>

                        <div className={`w-full md:w-2/5 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                            <div className="rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 md:p-6 shadow-2xl">
                                <div className="mb-6 md:mb-8 flex justify-center space-x-4">
                                    <img
                                        src="/forza-logo.png"
                                        alt="Forza Logo"
                                        className="h-10 md:h-12 brightness-200 contrast-200 hover:scale-110 transition-transform"
                                    />
                                    <img
                                        src="/gestar-logo.png"
                                        alt="Gestar Logo"
                                        className="h-10 md:h-12 brightness-200 contrast-200 hover:scale-110 transition-transform"
                                    />
                                </div>

                                {!showLogin ? (
                                    <div className="space-y-4 animate-fade-in">
                                        <Button
                                            onClick={() => setShowLogin(true)}
                                            variant="outline"
                                            className="w-full border-white/10 text-white hover:bg-white/10 py-4 md:py-5 text-sm md:text-base rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                        >
                                            <Lock className="mr-2 h-4 w-4" />
                                            Administrador
                                        </Button>
                                        <Button
                                            onClick={() => setShowLookupModal(true)}
                                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 md:py-5 text-sm md:text-base rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                        >
                                            <Search className="mr-2 h-4 w-4" />
                                            Registrar Numero de Sorteo
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
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
                                                onClick={() => setShowPassword(prev => !prev)}
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
                                            <label htmlFor="rememberMe" className="text-sm font-medium text-white">
                                                Recordar credenciales
                                            </label>
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 md:py-5 text-sm md:text-base rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                        >
                                            Iniciar sesión
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setShowLogin(false)}
                                            className="w-full text-white hover:bg-white/10 py-4 md:py-5 text-sm md:text-base rounded-xl transition-all duration-300"
                                        >
                                            Volver al inicio
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 text-white/50 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <ChevronDown className="animate-bounce" />
            </div>

            <LookupModal isOpen={showLookupModal} onOpenChange={setShowLookupModal} />
            
            <style>{`
                @keyframes star-pulse {
                    0%, 100% { opacity: 0.2; transform: scale(0.5) rotate(0deg); }
                    50% { opacity: 0.8; transform: scale(1.3) rotate(180deg); }
                }
                @keyframes hibiscus {
                    0%, 100% { opacity: 0.4; transform: scale(0.9) rotate(-45deg); }
                    50% { opacity: 0.7; transform: scale(1.2) rotate(0deg); }
                }
                @keyframes gradient-text {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-star-pulse { animation: star-pulse 4s ease-in-out infinite; }
                .animate-hibiscus { animation: hibiscus 5s ease-in-out infinite; }
                .animate-gradient-text { animation: gradient-text 6s ease infinite; }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
        </div>
    )
}

export default memo(HomePage)
