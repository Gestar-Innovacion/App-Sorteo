import { useCallback, useRef, useEffect } from 'react'

// URLs de sonidos
const SOUND_URLS = {
    drumroll: '/sounds/drum-roll-sound-effect-278576.mp3',
    fanfare: '/sounds/winning-218995.mp3',
    click: '/sounds/click.mp3',
}

type SoundType = keyof typeof SOUND_URLS

// Audio elements globales para reutilizar
const audioElements: Map<SoundType, HTMLAudioElement> = new Map()

// Precargar audios
const preloadAudio = (sound: SoundType): HTMLAudioElement => {
    if (!audioElements.has(sound)) {
        const audio = new Audio(SOUND_URLS[sound])
        audio.preload = 'auto'
        audio.load() // Forzar precarga
        audioElements.set(sound, audio)
    }
    return audioElements.get(sound)!
}

// Precargar todos al inicio
Object.keys(SOUND_URLS).forEach((sound) => {
    preloadAudio(sound as SoundType)
})

export function useSounds(isMuted: boolean = false) {
    const isMutedRef = useRef(isMuted)

    // Actualizar ref cuando cambia la prop
    useEffect(() => {
        isMutedRef.current = isMuted
    }, [isMuted])

    const play = useCallback((sound: SoundType, volume = 0.5) => {
        if (isMutedRef.current) {
            console.log('Sonido silenciado:', sound)
            return
        }

        try {
            const audio = preloadAudio(sound)
            audio.volume = volume
            audio.currentTime = 0
            
            const playPromise = audio.play()
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('Reproduciendo:', sound)
                    })
                    .catch((error) => {
                        console.warn('Error reproduciendo sonido:', sound, error)
                    })
            }
        } catch (error) {
            console.warn('Error con el audio:', error)
        }
    }, [])

    const stop = useCallback((sound: SoundType) => {
        const audio = audioElements.get(sound)
        if (audio) {
            audio.pause()
            audio.currentTime = 0
        }
    }, [])

    const stopAll = useCallback(() => {
        audioElements.forEach((audio) => {
            audio.pause()
            audio.currentTime = 0
        })
    }, [])

    return {
        play,
        stop,
        stopAll,
        playDrumroll: useCallback(() => play('drumroll', 0.6), [play]),
        playFanfare: useCallback(() => play('fanfare', 0.7), [play]),
        playClick: useCallback(() => play('click', 0.3), [play]),
    }
}
