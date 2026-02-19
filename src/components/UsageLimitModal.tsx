import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown, Zap, Shield, Sparkles } from 'lucide-react'
import { type FeatureKey, getFeatureInfo, LIMITS, getRemainingUses } from '@/utils/usageLimit'

interface UsageLimitModalProps {
  isOpen: boolean
  onClose: () => void
  feature: FeatureKey
}

export function UsageLimitModal({ isOpen, onClose, feature }: UsageLimitModalProps) {
  const info = getFeatureInfo(feature)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md rounded-2xl p-6 pointer-events-auto overflow-hidden"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-strong)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 60px rgba(201,168,76,0.1)',
              }}
            >
              {/* Decorative glow */}
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ background: 'var(--accent-gold)' }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-5">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))',
                    border: '1.5px solid rgba(201,168,76,0.4)',
                    boxShadow: '0 0 30px rgba(201,168,76,0.15)',
                  }}
                >
                  <Crown size={28} style={{ color: 'var(--accent-gold)' }} />
                </motion.div>
              </div>

              {/* Title */}
              <h3
                className="text-xl font-bold text-center mb-2"
                style={{ color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif' }}
              >
                일일 무료 사용 한도 도달
              </h3>

              <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-gold)' }}>{info.emoji} {info.label}</span>의
                오늘 무료 사용 횟수({info.limit}회)를 모두 사용하였습니다.
              </p>

              {/* Usage bar */}
              <div
                className="rounded-xl p-4 mb-6"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    오늘 사용량
                  </span>
                  <span className="text-xs font-bold" style={{ color: 'var(--accent-gold)' }}>
                    {info.limit} / {info.limit}
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--accent-gold), #e0a040)' }}
                  />
                </div>

                {/* All feature limits */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {(['quickConsult', 'trial', 'document'] as FeatureKey[]).map(f => {
                    const fi = getFeatureInfo(f)
                    const remaining = getRemainingUses(f)
                    const isActive = f === feature
                    return (
                      <div
                        key={f}
                        className="rounded-lg p-2 text-center"
                        style={{
                          background: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
                          border: isActive ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                        }}
                      >
                        <div className="text-sm mb-0.5">{fi.emoji}</div>
                        <div
                          className="text-[10px] font-bold"
                          style={{ color: remaining === 0 ? 'var(--prosecutor)' : 'var(--text-primary)' }}
                        >
                          {remaining}/{LIMITS[f]}
                        </div>
                        <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                          남음
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Pro upsell */}
              <div
                className="rounded-xl p-4 mb-5"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))',
                  border: '1px solid rgba(201,168,76,0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} style={{ color: 'var(--accent-gold)' }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--accent-gold)' }}>
                    Pro 플랜으로 업그레이드
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { icon: Zap, text: '무제한 법률 상담 & 재판 시뮬레이션' },
                    { icon: Shield, text: 'PDF 판결 보고서 내보내기' },
                    { icon: Crown, text: '우선 처리 & 전용 고객 지원' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2">
                      <Icon size={12} style={{ color: 'var(--accent-gold)' }} />
                      <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  내일 다시 이용
                </button>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(201,168,76,0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"
                  style={{ background: 'var(--accent-gold)', color: '#1a1208' }}
                  onClick={onClose}
                >
                  <Crown size={14} />
                  Pro 시작하기
                </motion.button>
              </div>

              {/* Disclaimer */}
              <p className="text-[9px] text-center mt-3 opacity-50" style={{ color: 'var(--text-muted)' }}>
                자정(00:00) 기준으로 무료 사용량이 초기화됩니다
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
