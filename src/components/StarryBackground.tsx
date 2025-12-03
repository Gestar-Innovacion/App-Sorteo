import { memo, useMemo } from 'react'

interface StarData {
    id: number
    top: string
    left: string
    delay: string
}

const Star = memo(({ data }: { data: StarData }) => (
    <div
        className="absolute h-1 w-1 bg-white rounded-full animate-twinkle"
        style={{
            top: data.top,
            left: data.left,
            animationDelay: data.delay,
        }}
    />
))

Star.displayName = 'Star'

export const StarryBackground = memo(() => {
    // Generar estrellas una sola vez
    const stars = useMemo<StarData[]>(() => {
        return Array.from({ length: 50 }, (_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 5}s`,
        }))
    }, [])

    return (
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-blue-800">
            <div className="absolute inset-0">
                {stars.map((star) => (
                    <Star key={star.id} data={star} />
                ))}
            </div>
            <style>{`
                @keyframes twinkle {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(0.8);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.2);
                    }
                }
                .animate-twinkle {
                    animation: twinkle 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
})

StarryBackground.displayName = 'StarryBackground'


