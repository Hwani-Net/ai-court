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
    bgInactive: 'rgba(224, 82, 82, 0.06)',
    glowColor: 'rgba(224, 82, 82, 0.6)',
    position: 'left' as const,
  },
  {
    id: 'judge' as const,
    icon: '⚖️',
    label: '판사',
    color: 'var(--accent-gold)',
    bgActive: 'rgba(201, 168, 76, 0.28)',
    bgInactive: 'rgba(201, 168, 76, 0.06)',
    glowColor: 'rgba(201, 168, 76, 0.6)',
    position: 'center' as const,
  },
  {
    id: 'defense' as const,
    icon: '변',
    label: '변호사/피고',
    color: 'var(--defense)',
    bgActive: 'rgba(74, 144, 217, 0.25)',
    bgInactive: 'rgba(74, 144, 217, 0.06)',
    glowColor: 'rgba(74, 144, 217, 0.6)',
    position: 'right' as const,
  },
]

// Round → role mapping
const ROUND_ROLES: Record<number, 'judge' | 'prosecutor' | 'defense'> = {
  1: 'judge', 2: 'prosecutor', 3: 'defense',
  4: 'judge', 5: 'prosecutor', 6: 'defense', 7: 'judge',
}
const ROUND_LABELS: Record<number, string> = {
  1: '개정', 2: '원고 주장', 3: '피고 반박',
  4: '쟁점 정리', 5: '원고 재반박', 6: '최후 변론', 7: '판결',
}
const ROLE_COLORS: Record<string, string> = {
  judge: 'var(--accent-gold)',
  prosecutor: 'var(--prosecutor)',
  defense: 'var(--defense)',
}

export function CourtRoom({ activeRole, currentRound, isLoading }: CourtRoomProps) {
  return (
    <div
      className="wood-panel relative overflow-hidden"
      style={{ padding: '10px 16px 12px' }}
    >
      {/* Ambient glow behind active speaker */}
      {activeRole && (
        <motion.div
          key={activeRole}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at ${
              activeRole === 'prosecutor' ? '15% 60%' :
              activeRole === 'defense' ? '85% 60%' : '50% 20%'
            }, ${SEATS.find(s => s.id === activeRole)?.glowColor || 'transparent'} 0%, transparent 65%)`,
            opacity: 0.35,
          }}
        />
      )}

      {/* 3 seats */}
      <div className="flex items-end justify-center gap-4 sm:gap-10 relative z-10 mb-2">
        {SEATS.map((seat) => {
          const isActive = activeRole === seat.id
          const isCenter = seat.position === 'center'

          return (
            <motion.div
              key={seat.id}
              animate={{
                scale: isActive ? (isCenter ? 1.12 : 1.08) : 1,
                opacity: activeRole === null ? 1 : isActive ? 1 : 0.35,
                y: isActive ? -2 : 0,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-1"
            >
              {/* Avatar */}
              <div className="relative">
                {/* Pulse ring for active speaker */}
                {isActive && isLoading && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: `2px solid ${seat.color}` }}
                      animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
                      transition={{ duration: 1.0, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: `2px solid ${seat.color}` }}
                      animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
                      transition={{ duration: 1.0, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                    />
                  </>
                )}
                <div
                  className={`flex items-center justify-center rounded-full font-bold transition-all ${
                    isCenter ? 'w-12 h-12 sm:w-14 sm:h-14 text-xl' : 'w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base'
                  }`}
                  style={{
                    background: isActive ? seat.bgActive : seat.bgInactive,
                    border: `2px solid ${isActive ? seat.color : 'rgba(255,255,255,0.08)'}`,
                    color: seat.color,
                    boxShadow: isActive
                      ? `0 0 24px ${seat.glowColor}, 0 0 8px ${seat.glowColor} inset`
                      : 'none',
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

              {/* Speaking dots */}
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
                      animate={{ scale: [1, 1.8, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Round timeline */}
      <div className="relative z-10 flex items-center gap-0 mt-1">
        {Array.from({ length: 7 }, (_, i) => {
          const r = i + 1
          const role = ROUND_ROLES[r]
          const color = ROLE_COLORS[role]
          const isDone = r < currentRound
          const isCurrent = r === currentRound
          const isFuture = r > currentRound

          return (
            <div key={r} className="flex items-center flex-1">
              {/* Step dot */}
              <motion.div
                animate={{
                  scale: isCurrent ? [1, 1.2, 1] : 1,
                }}
                transition={isCurrent ? { duration: 1.5, repeat: Infinity } : {}}
                className="relative flex-shrink-0"
                title={`R${r}: ${ROUND_LABELS[r]}`}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{
                    background: isDone
                      ? color
                      : isCurrent
                        ? color
                        : 'rgba(255,255,255,0.06)',
                    border: `1.5px solid ${isFuture ? 'rgba(255,255,255,0.12)' : color}`,
                    color: isDone || isCurrent ? '#1a1208' : 'var(--text-muted)',
                    boxShadow: isCurrent ? `0 0 8px ${color}` : 'none',
                    opacity: isFuture ? 0.4 : 1,
                  }}
                >
                  {isDone ? '✓' : r}
                </div>
              </motion.div>

              {/* Connector line */}
              {r < 7 && (
                <div className="flex-1 h-[1.5px] mx-0.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  {isDone && (
                    <motion.div
                      className="h-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.4 }}
                      style={{ background: ROLE_COLORS[ROUND_ROLES[r]] }}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Current round label */}
      <div className="text-center mt-1 relative z-10">
        <span
          className="text-[9px] tracking-widest uppercase font-medium"
          style={{ color: 'var(--accent-gold-dark)', letterSpacing: '0.12em' }}
        >
          {currentRound <= 7 ? `R${currentRound} · ${ROUND_LABELS[currentRound]}` : '재판 종결'}
        </span>
      </div>

      {/* Bench bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--accent-gold-dark), var(--accent-gold), var(--accent-gold-dark), transparent)',
        }}
      />
    </div>
  )
}
