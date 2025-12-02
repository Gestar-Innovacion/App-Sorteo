import { useState, useEffect, memo, useRef } from 'react'
import { motion } from 'framer-motion'

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
}

const CountdownUnit = memo(({ value, label }: { value: number, label: string }) => (
    <motion.div
        className="flex flex-col items-center"
        whileHover={{ scale: 1.1 }}
    >
        <motion.span
            className="text-5xl font-bold text-white mb-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={value}
        >
            {String(value).padStart(2, '0')}
        </motion.span>
        <span className="text-white/60 text-sm">{label}</span>
    </motion.div>
))

CountdownUnit.displayName = 'CountdownUnit'

export const Countdown = memo(({ targetDate }: { targetDate: Date }) => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })
    
    const targetTimeRef = useRef(targetDate.getTime())

    useEffect(() => {
        targetTimeRef.current = targetDate.getTime()
    }, [targetDate])

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = targetTimeRef.current - Date.now()

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                })
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            }
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <motion.div
            className="grid grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
        >
            <CountdownUnit value={timeLeft.days} label="Días" />
            <CountdownUnit value={timeLeft.hours} label="Horas" />
            <CountdownUnit value={timeLeft.minutes} label="Minutos" />
            <CountdownUnit value={timeLeft.seconds} label="Segundos" />
        </motion.div>
    )
})

Countdown.displayName = 'Countdown'
