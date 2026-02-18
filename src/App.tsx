import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, ChevronLeft, Github, ExternalLink } from 'lucide-react'
import { ModeSelector } from '@/components/ModeSelector'
import { QuickConsultPage } from '@/pages/QuickConsultPage'
import { TrialPage } from '@/pages/TrialPage'
import { DocumentPage } from '@/pages/DocumentPage'
import type { CourtMode } from '@/types'
import './index.css'

function LandingHero({ onStart }: { onStart: (mode: CourtMode) => void }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Scale size={22} style={{ color: 'var(--accent-gold)' }} />
          <span className="font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--accent-gold)' }}>
            AI Court
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Github size={18} style={{ color: 'var(--text-muted)' }} />
          </a>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--accent-gold)', border: '1px solid rgba(201,168,76,0.3)' }}>
            Beta
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="text-7xl mb-6"
        >
          ⚖️
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}
        >
          AI가 당신의{' '}
          <span style={{ color: 'var(--accent-gold)' }}>법정</span>을 열다
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg max-w-xl mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          AI 판사·검사·변호사가 실제 법정처럼 당신의 사건을 심리합니다.
          법률 상담부터 가상 재판까지, 재판 결과를 미리 예측하세요.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-4 mb-12 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>✅ 무료 법률 상담</span>
          <span>•</span>
          <span>⚔️ 가상 재판 시뮬레이션</span>
          <span>•</span>
          <span>📄 소송장 분석</span>
        </motion.div>

        {/* Mode cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full"
        >
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            원하는 서비스를 선택하세요
          </p>
          <ModeSelector onSelect={onStart} />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-8 mt-16 text-center"
        >
          {[
            { value: 'GPT-4o', label: 'AI 엔진' },
            { value: '3인', label: '법정 역할' },
            { value: '8개', label: '법률 분야' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-xl font-bold" style={{ color: 'var(--accent-gold)' }}>{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        ⚠️ AI Court는 법률 정보 제공 목적이며 실제 법률 자문이 아닙니다. 중요한 법적 문제는 변호사와 상담하세요.
      </footer>
    </div>
  )
}

function CourtLayout({ mode, onBack }: { mode: CourtMode; onBack: () => void }) {
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
        <div className="ml-auto">
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
          <LandingHero onStart={setActiveMode} />
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
          <CourtLayout mode={activeMode} onBack={() => setActiveMode(null)} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
