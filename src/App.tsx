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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Background ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute w-[600px] h-[600px] rounded-full mix-blend-screen opacity-10 blur-3xl"
          style={{
            top: '-20%', left: '-10%',
            background: 'radial-gradient(circle, var(--accent-gold) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full mix-blend-screen opacity-10 blur-3xl"
          style={{
            bottom: '10%', right: '-15%',
            background: 'radial-gradient(circle, var(--defense) 0%, transparent 70%)',
            animation: 'float 10s ease-in-out 2s infinite reverse',
          }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)',
          }}
        />
      </div>

      {/* Top nav */}
      <nav className="relative flex items-center justify-between px-6 py-5 z-20">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <Scale size={18} style={{ color: 'var(--accent-gold)' }} />
          </motion.div>
          <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--accent-gold)' }}>
            AI Court
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggleBtn theme={theme} onToggle={onToggleTheme} />
          <a
            href="https://github.com/Hwani-Net/ai-court"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Github size={18} style={{ color: 'var(--text-muted)' }} />
          </a>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 pb-12 z-10 w-full max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center w-full"
        >
          {/* Animated Icon Box */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))',
                border: '1px solid rgba(201,168,76,0.3)',
                boxShadow: '0 0 40px rgba(201,168,76,0.15)',
              }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Spinning Ring */}
            <div className="absolute inset-[-4px] rounded-[28px] border border-[rgba(201,168,76,0.2)] animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center text-5xl filter drop-shadow-lg">
              ⚖️
            </div>
          </div>

          {/* Typography */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1]" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span className="block text-[var(--accent-gold)] relative inline-block">
              AI 법정
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[var(--accent-gold)] opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5 L 100 0 Q 50 5 0 0 Z" fill="currentColor" />
              </svg>
            </span>
            <span className="text-[var(--text-primary)]">이 시작됩니다</span>
          </h1>

          <p className="text-sm sm:text-lg text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            최신 AI 기술로 구현된 가상 법정 시뮬레이션.<br className="hidden sm:block"/>
            당신의 사건을 입력하고 <span className="text-[var(--accent-gold)] font-medium">7라운드 심리 과정</span>을 직접 경험하세요.
          </p>

          {/* Mode Selector Section */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
              <span className="text-xs font-semibold tracking-widest text-[var(--accent-gold)] uppercase">Select Mode</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
            </div>
            
            <ModeSelector onSelect={onStart} />

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: 'AI 엔진', value: 'GPT-4o' },
                { label: '재판 라운드', value: '7단계', numericValue: 7 },
                { label: '법정 역할', value: '3인', numericValue: 3 },
                { label: '법률 분야', value: '8개+', numericValue: 8 },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/50 backdrop-blur-sm card-hover flex flex-col items-center justify-center gap-1 group"
                >
                  <div className="text-xl sm:text-2xl font-bold text-[var(--accent-gold)] group-hover:scale-110 transition-transform">
                    {stat.numericValue ? <StatItem value={stat.value} numericValue={stat.numericValue} label="" index={i} /> : stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      <footer className="py-6 text-center text-[10px] text-[var(--text-muted)] border-t border-[var(--border)] bg-[var(--bg-secondary)]/50 backdrop-blur-md z-20">
        <p className="mb-1">⚠️ AI Court는 법률 정보 제공 목적이며 실제 법률 자문이 아닙니다.</p>
        <p>© 2024 AI Court. Powered by OpenAI & Cloudflare Pages.</p>
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
