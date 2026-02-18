import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Scale, ChevronLeft, Github, Moon, Sun, ExternalLink } from 'lucide-react'
import { ModeSelector } from '@/components/ModeSelector'
import { QuickConsultPage } from '@/pages/QuickConsultPage'
import { TrialPage } from '@/pages/TrialPage'
import { DocumentPage } from '@/pages/DocumentPage'
import { useTheme } from '@/hooks/useTheme'
import type { CourtMode } from '@/types'
import './index.css'

function ThemeToggleBtn({ theme, onToggle }: { theme: 'dark' | 'light'; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg transition-all hover:scale-110"
      style={{
        background: theme === 'dark' ? 'rgba(201,168,76,0.1)' : 'rgba(160,120,48,0.12)',
        border: '1px solid var(--border)',
        color: 'var(--accent-gold)',
      }}
      title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

// Animated count-up hook
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return { count, ref }
}

function StatItem({ value, numericValue, label, index }: {
  value: string
  numericValue?: number
  label: string
  index: number
}) {
  const { count, ref } = useCountUp(numericValue ?? 0)
  const suffix = numericValue !== undefined ? value.replace(/[0-9]/g, '') : ''
  const displayValue = numericValue !== undefined ? `${count}${suffix}` : value
  return (
    <div ref={ref} className="text-center" style={{ minWidth: '72px' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 + index * 0.1 }}
        className="text-lg sm:text-xl font-bold mb-0.5"
        style={{ color: 'var(--accent-gold)' }}
      >
        {displayValue}
      </motion.div>
      <div className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
    </div>
  )
}

function LandingHero({ onStart, theme, onToggleTheme }: {
  onStart: (mode: CourtMode) => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            top: '-15%', left: '-10%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)',
            animation: 'float-orb 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            bottom: '10%', right: '-8%',
            background: 'radial-gradient(circle, rgba(74,144,217,0.06) 0%, transparent 70%)',
            animation: 'float-orb 10s ease-in-out 2s infinite reverse',
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full"
          style={{
            top: '40%', left: '60%',
            background: 'radial-gradient(circle, rgba(224,82,82,0.04) 0%, transparent 70%)',
            animation: 'float-orb 12s ease-in-out 4s infinite',
          }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Top nav */}
      <nav className="relative flex items-center justify-between px-4 sm:px-8 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Scale size={22} style={{ color: 'var(--accent-gold)' }} />
          </motion.div>
          <span className="font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--accent-gold)' }}>
            AI Court
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Hwani-Net/ai-court"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            title="GitHub"
          >
            <Github size={18} style={{ color: 'var(--text-muted)' }} />
          </a>
          <ThemeToggleBtn theme={theme} onToggle={onToggleTheme} />
          <motion.span
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs px-3 py-1 rounded-full"
            style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--accent-gold)', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            Beta
          </motion.span>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-10 sm:py-14 text-center">
        {/* Gavel icon with animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
          className="mb-6 relative"
        >
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(201,168,76,0.2) 0%, rgba(201,168,76,0.05) 100%)',
              border: '1.5px solid rgba(201,168,76,0.4)',
              boxShadow: '0 0 40px rgba(201,168,76,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <span className="text-4xl sm:text-5xl">⚖️</span>
          </div>
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ border: '1px solid rgba(201,168,76,0.4)' }}
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight"
          style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}
        >
          AI가 당신의{' '}
          <span
            style={{
              color: 'var(--accent-gold)',
              textShadow: '0 0 30px rgba(201,168,76,0.4)',
            }}
          >
            법정
          </span>을 열다
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-sm sm:text-base md:text-lg max-w-lg mb-6 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          AI 판사·검사·변호사가 실제 법정처럼 당신의 사건을 심리합니다.
          <br className="hidden sm:block" />
          법률 상담부터 가상 재판까지, 재판 결과를 미리 예측하세요.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          {[
            { icon: '✅', text: '무료 법률 상담' },
            { icon: '⚔️', text: '가상 재판 시뮬레이션' },
            { icon: '📄', text: '소송장 분석' },
          ].map(({ icon, text }) => (
            <span
              key={text}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <span>{icon}</span>
              <span>{text}</span>
            </span>
          ))}
        </motion.div>

        {/* Mode selector label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs mb-5 tracking-widest uppercase font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          — 원하는 서비스를 선택하세요 —
        </motion.p>

        {/* Mode cards */}
        <ModeSelector onSelect={onStart} />

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="flex items-stretch mt-12 rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
        >
          {[
            { value: 'GPT-4o', label: 'AI 엔진' },
            { value: '7라운드', numericValue: 7, label: '재판 진행' },
            { value: '3인', numericValue: 3, label: '법정 역할' },
            { value: '8개', numericValue: 8, label: '법률 분야' },
          ].map((stat, i, arr) => (
            <div key={stat.label} className="flex items-center">
              <div className="px-5 py-4">
                <StatItem {...stat} index={i} />
              </div>
              {i < arr.length - 1 && (
                <div className="self-stretch w-px" style={{ background: 'var(--border)' }} />
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative text-center py-4 text-xs border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        ⚠️ AI Court는 법률 정보 제공 목적이며 실제 법률 자문이 아닙니다. 중요한 법적 문제는 변호사와 상담하세요.
      </footer>
    </div>
  )
}

function CourtLayout({ mode, onBack, theme, onToggleTheme }: {
  mode: CourtMode
  onBack: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}) {
  const modeLabels: Record<CourtMode, string> = {
    quick: '⚡ 빠른 법률 상담',
    trial: '⚔️ 가상 재판',
    document: '📄 소송장 분석',
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={16} />
          <span className="text-xs">홈</span>
        </button>
        <div className="gold-divider w-px h-4" style={{ background: 'var(--border)', width: '1px' }} />
        <div className="flex items-center gap-2">
          <Scale size={16} style={{ color: 'var(--accent-gold)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--accent-gold)', fontFamily: 'Playfair Display, serif' }}>
            AI Court
          </span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          {modeLabels[mode]}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggleBtn theme={theme} onToggle={onToggleTheme} />
          <a
            href="https://hack.primer.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
          >
            Primer Hackathon <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {mode === 'quick' && <QuickConsultPage />}
            {mode === 'trial' && <TrialPage />}
            {mode === 'document' && <DocumentPage />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function App() {
  const [activeMode, setActiveMode] = useState<CourtMode | null>(null)
  const { theme, toggleTheme } = useTheme()

  return (
    <AnimatePresence mode="wait">
      {!activeMode ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LandingHero onStart={setActiveMode} theme={theme} onToggleTheme={toggleTheme} />
        </motion.div>
      ) : (
        <motion.div
          key="court"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-screen"
        >
          <CourtLayout mode={activeMode} onBack={() => setActiveMode(null)} theme={theme} onToggleTheme={toggleTheme} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
