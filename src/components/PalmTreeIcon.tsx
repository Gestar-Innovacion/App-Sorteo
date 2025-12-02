interface PalmTreeIconProps {
  className?: string
  size?: number
}

export function PalmTreeIcon({ className = '', size = 24 }: PalmTreeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tronco */}
      <path
        d="M45 80 L45 110 L55 110 L55 80 Z"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Hojas de palmera - izquierda */}
      <path
        d="M50 30 Q30 20 20 40 Q25 35 30 45 Q35 40 40 50 Q45 45 50 50"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M50 30 Q25 15 15 35 Q20 30 28 42 Q35 38 42 48 Q46 44 50 48"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Hojas de palmera - derecha */}
      <path
        d="M50 30 Q70 20 80 40 Q75 35 70 45 Q65 40 60 50 Q55 45 50 50"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M50 30 Q75 15 85 35 Q80 30 72 42 Q65 38 58 48 Q54 44 50 48"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Hojas de palmera - centro arriba */}
      <path
        d="M50 30 Q50 10 50 20 Q48 15 46 25 Q50 20 54 25 Q50 15 50 20"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Hojas de palmera - centro izquierda */}
      <path
        d="M50 30 Q35 25 30 50 Q38 40 42 55 Q40 50 45 60 Q43 55 48 58"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Hojas de palmera - centro derecha */}
      <path
        d="M50 30 Q65 25 70 50 Q62 40 58 55 Q60 50 55 60 Q57 55 52 58"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

