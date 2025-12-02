interface HibiscusFlowerProps {
  className?: string
  size?: number
}

export function HibiscusFlower({ className = '', size = 24 }: HibiscusFlowerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pétalos exteriores */}
      <path
        d="M50 20 Q60 25 65 35 Q60 40 50 45 Q40 40 35 35 Q40 25 50 20 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M80 50 Q75 60 65 65 Q60 60 55 50 Q60 40 70 45 Q75 45 80 50 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M50 80 Q40 75 35 65 Q40 60 50 55 Q60 60 65 65 Q60 75 50 80 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M20 50 Q25 40 35 35 Q40 40 45 50 Q40 60 30 55 Q25 55 20 50 Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Pétalos interiores */}
      <path
        d="M50 30 Q55 35 60 40 Q55 45 50 50 Q45 45 40 40 Q45 35 50 30 Z"
        fill="currentColor"
        opacity="0.7"
      />
      {/* Centro */}
      <circle
        cx="50"
        cy="50"
        r="8"
        fill="#FFD700"
        opacity="0.8"
      />
      <circle
        cx="50"
        cy="50"
        r="4"
        fill="#FFA500"
      />
    </svg>
  )
}

