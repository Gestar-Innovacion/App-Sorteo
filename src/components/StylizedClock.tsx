import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

export const StylizedClock = memo(({ date }: { date: Date }) => {
    const formattedDate = useMemo(() => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }
        return date.toLocaleDateString('es-ES', options)
    }, [date])

    const formattedTime = useMemo(() => {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }, [date])

    return (
        <motion.div
            className="bg-white/5 backdrop-blur-sm rounded-[32px] px-12 py-6 text-center relative overflow-hidden"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
            <div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-shift"
            />
            <motion.div
                className="text-white text-2xl font-medium mb-2 relative z-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                {formattedDate}
            </motion.div>
            <motion.div
                className="text-white text-6xl font-bold relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                {formattedTime}
            </motion.div>
            
            <style>{`
                @keyframes gradient-shift {
                    0%, 100% { transform: translateX(-100%); }
                    50% { transform: translateX(100%); }
                }
                .animate-gradient-shift {
                    animation: gradient-shift 10s linear infinite;
                }
            `}</style>
        </motion.div>
    )
})

StylizedClock.displayName = 'StylizedClock'
