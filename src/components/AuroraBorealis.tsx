import { memo } from 'react'

export const AuroraBorealis = memo(() => {
    return (
        <div className="fixed inset-0 overflow-hidden bg-black">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-black" />
            
            {/* Capas de aurora con CSS puro para mejor rendimiento */}
            <div
                className="absolute inset-0 opacity-50 animate-aurora-1"
                style={{
                    background: 'linear-gradient(45deg, #00ff00, #0000ff, #ff00ff)',
                }}
            />
            <div
                className="absolute inset-0 opacity-40 animate-aurora-2"
                style={{
                    background: 'linear-gradient(135deg, #ff00ff, #00ffff, #ffff00)',
                }}
            />
            <div
                className="absolute inset-0 opacity-30 animate-aurora-3"
                style={{
                    background: 'linear-gradient(225deg, #ff0000, #00ff00, #0000ff)',
                }}
            />
            
            <style>{`
                @keyframes aurora-1 {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(10%); }
                }
                @keyframes aurora-2 {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(6%); }
                }
                @keyframes aurora-3 {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(4%); }
                }
                .animate-aurora-1 {
                    animation: aurora-1 20s ease-in-out infinite;
                }
                .animate-aurora-2 {
                    animation: aurora-2 25s ease-in-out infinite;
                    animation-delay: -5s;
                }
                .animate-aurora-3 {
                    animation: aurora-3 30s ease-in-out infinite;
                    animation-delay: -10s;
                }
            `}</style>
        </div>
    )
})

AuroraBorealis.displayName = 'AuroraBorealis'
