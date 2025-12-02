import { useMemo, memo } from 'react'

interface SnowflakeData {
    id: number
    left: number
    size: number
    duration: number
    delay: number
    xOffset: number
}

const Snowflake = memo(({ data }: { data: SnowflakeData }) => {
    return (
        <div
            className="absolute text-white/40 animate-snowfall"
            style={{
                left: `${data.left}%`,
                fontSize: `${data.size}px`,
                animationDuration: `${data.duration}s`,
                animationDelay: `${data.delay}s`,
                '--x-offset': `${data.xOffset}px`,
            } as React.CSSProperties}
        >
            ❄
        </div>
    )
})

Snowflake.displayName = 'Snowflake'

export const SnowEffect = memo(() => {
    // Generar datos de copos una sola vez con useMemo
    const snowflakes = useMemo<SnowflakeData[]>(() => {
        return Array.from({ length: 25 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: Math.random() * 4 + 4,
            duration: 15 + Math.random() * 10,
            delay: Math.random() * 10,
            xOffset: (Math.random() - 0.5) * 100,
        }))
    }, [])

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[2]">
            {snowflakes.map((flake) => (
                <Snowflake key={flake.id} data={flake} />
            ))}
            <style>{`
                @keyframes snowfall {
                    0% {
                        transform: translateY(-5vh) translateX(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(105vh) translateX(var(--x-offset)) rotate(360deg);
                        opacity: 0;
                    }
                }
                .animate-snowfall {
                    animation: snowfall linear infinite;
                }
            `}</style>
        </div>
    )
})

SnowEffect.displayName = 'SnowEffect'
