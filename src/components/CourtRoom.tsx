import { motion } from 'framer-motion'

interface CourtRoomProps {
  activeRole: 'judge' | 'prosecutor' | 'defense' | null
  currentRound: number
  isLoading: boolean
}

const SEATS = [
  {
    id: 'prosecutor' as const,
    icon: '검',
    label: '검사/원고',
    color: 'var(--prosecutor)',
    bgActive: 'rgba(224, 82, 82, 0.25)',
    bgInactive: 'rgba(224, 82, 82, 0.08)',
    glowColor: 'rgba(224, 82, 82, 0.5)',
    position: 'left' as const,
  },
  {
    id: 'judge' as const,
    icon: '⚖️',
    label: '판사',
    color: 'var(--accent-gold)',
    bgActive: 'rgba(201, 168, 76, 0.25)',
    bgInactive: 'rgba(201, 168, 76, 0.08)',
    glowColor: 'rgba(201, 168, 76, 0.5)',
    position: 'center' as const,
  },
  {
    id: 'defense' as const,
    icon: '변',
    label: '변호사/피고',
    color: 'var(--defense)',
    bgActive: 'rgba(74, 144, 217, 0.25)',
    bgInactive: 'rgba(74, 144, 217, 0.08)',
    glowColor: 'rgba(74, 144, 217, 0.5)',
    position: 'right' as const,
  },
]

export function CourtRoom({ activeRole, currentRound, isLoading }: CourtRoomProps) {
  return (
    <div
      className="wood-panel relative overflow-hidden"
      style={{ padding: '12px 16px 14px' }}
    >
      {/* Ambient glow behind active speaker */}
      {activeRole && (
        <motion.div
          key={activeRole}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at ${
              activeRole === 'prosecutor' ? '20% 50%' :
              activeRole === 'defense' ? '80% 50%' : '50% 30%'
            }, ${SEATS.find(s => s.id === activeRole)?.glowColor || 'transparent'} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Round indicator */}
      <div className="text-center mb-2 relative z-10">
        <span
          className="text-[10px] tracking-widest uppercase font-medium"
          style={{ color: 'var(--accent-gold-dark)', letterSpacing: '0.15em' }}
        >
          제 {currentRound}/7 회 공판
        </span>
      </div>

      {/* 3 seats */}
      <div className="flex items-end justify-center gap-4 sm:gap-8 relative z-10">
        {SEATS.map((seat) => {
          const isActive = activeRole === seat.id
          const isCenter = seat.position === 'center'

          return (
            <motion.div
              key={seat.id}
              animate={{
                scale: isActive ? 1.1 : 1,
                opacity: activeRole === null ? 1 : isActive ? 1 : 0.4,
              }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="flex flex-col items-center gap-1"
            >
              {/* Avatar circle */}
              <div className="relative">
                {/* Pulse ring for active speaker */}
                {isActive && isLoading && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: `2px solid ${seat.color}` }}
                    animate={{
                      scale: [1, 1.5],
                      opacity: [0.6, 0],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                )}
                <div
                  className={`flex items-center justify-center rounded-full font-bold transition-all ${
                    isCenter ? 'w-11 h-11 sm:w-14 sm:h-14 text-lg sm:text-xl' : 'w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base'
                  }`}
                  style={{
                    background: isActive ? seat.bgActive : seat.bgInactive,
                    border: `2px solid ${isActive ? seat.color : 'transparent'}`,
                    color: seat.color,
                    boxShadow: isActive ? `0 0 20px ${seat.glowColor}` : 'none',
                  }}
                >
                  {seat.icon}
                </div>
              </div>

              {/* Label */}
              <span
                className="text-[10px] sm:text-xs font-medium whitespace-nowrap"
                style={{ color: isActive ? seat.color : 'var(--text-muted)' }}
              >
                {seat.label}
              </span>

              {/* Speaking indicator */}
              {isActive && isLoading && (
                <motion.div
                  className="flex gap-0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 rounded-full"
                      style={{ background: seat.color }}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Bench bar (bottom decoration) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--accent-gold-dark), var(--accent-gold), var(--accent-gold-dark), transparent)',
        }}
      />
    </div>
  )
}
