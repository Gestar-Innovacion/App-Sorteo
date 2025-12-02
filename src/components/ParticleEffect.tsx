import { useEffect, useRef, useMemo, memo, useCallback } from 'react'

interface ParticleData {
    id: number
    x: number
    y: number
    size: number
    delay: number
}

const Particle = memo(({ data }: { data: ParticleData }) => {
    return (
        <div
            className="absolute rounded-full bg-white animate-particle-pulse"
            style={{
                width: data.size,
                height: data.size,
                left: `${data.x}%`,
                top: `${data.y}%`,
                animationDelay: `${data.delay}s`,
            }}
        />
    )
})

Particle.displayName = 'Particle'

export const ParticleEffect = memo(() => {
    const particlesRef = useRef<HTMLDivElement>(null)
    const rafRef = useRef<number | null>(null)
    const lastUpdateRef = useRef<number>(0)
    
    // Generar partículas una sola vez
    const particles = useMemo<ParticleData[]>(() => {
        return Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 5,
        }))
    }, [])

    // Throttled mouse move handler usando RAF
    const handleMouseMove = useCallback((e: MouseEvent) => {
        const now = performance.now()
        // Limitar actualizaciones a ~30fps
        if (now - lastUpdateRef.current < 33) return
        
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
        }
        
        rafRef.current = requestAnimationFrame(() => {
            if (particlesRef.current) {
                const { clientX, clientY } = e
                const { left, top, width, height } = particlesRef.current.getBoundingClientRect()
                const x = (clientX - left) / width
                const y = (clientY - top) / height
                particlesRef.current.style.setProperty('--mouse-x', x.toString())
                particlesRef.current.style.setProperty('--mouse-y', y.toString())
            }
            lastUpdateRef.current = now
        })
    }, [])

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove, { passive: true })
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
            }
        }
    }, [handleMouseMove])

    return (
        <div
            ref={particlesRef}
            className="fixed inset-0 pointer-events-none z-[2]"
            style={{
                '--mouse-x': '0.5',
                '--mouse-y': '0.5',
            } as React.CSSProperties}
        >
            {particles.map((particle) => (
                <Particle key={particle.id} data={particle} />
            ))}
            
            {/* Gradiente que sigue al mouse */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(circle at calc(var(--mouse-x) * 100%) calc(var(--mouse-y) * 100%), rgba(255,255,255,0.05) 0%, transparent 40%)`,
                }}
            />
            
            <style>{`
                @keyframes particle-pulse {
                    0%, 100% {
                        opacity: 0;
                        transform: scale(0);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1);
                    }
                }
                .animate-particle-pulse {
                    animation: particle-pulse 5s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
})

ParticleEffect.displayName = 'ParticleEffect'
