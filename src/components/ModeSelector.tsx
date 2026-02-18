import { motion } from 'framer-motion'
import { Scale, Zap, FileText, ArrowRight } from 'lucide-react'
import type { CourtMode } from '@/types'

interface ModeSelectorProps {
  onSelect: (mode: CourtMode) => void
}

const MODES = [
  {
    id: 'trial' as CourtMode,
    icon: Scale,
    emoji: '⚔️',
    title: '가상 재판 시뮬레이션',
    subtitle: 'AI 판사·검사·변호사의 3자 대면',
    description: '원고와 피고 양측 주장을 입력하면 실제 법정처럼 7라운드 공방을 펼치고 판결을 내립니다.',
    color: 'var(--accent-gold)',
    bgGradient: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.02) 100%)',
    borderColor: 'rgba(201,168,76,0.4)',
    glowColor: 'rgba(201,168,76,0.25)',
    badge: '추천',
    badgeClass: 'badge badge-gold',
  },
  {
    id: 'quick' as CourtMode,
    icon: Zap,
    emoji: '⚡',
    title: '빠른 법률 상담',
    subtitle: '1분 안에 핵심 법률 요점 정리',
    description: '복잡한 법률 문제를 질문하면 즉시 관련 법령과 판례를 기반으로 핵심을 요약해드립니다.',
    color: 'var(--defense)',
    bgGradient: 'linear-gradient(135deg, rgba(74,144,217,0.12) 0%, rgba(74,144,217,0.02) 100%)',
    borderColor: 'rgba(74,144,217,0.35)',
    glowColor: 'rgba(74,144,217,0.2)',
    badge: '무료',
    badgeClass: 'badge badge-blue',
  },
  {
    id: 'document' as CourtMode,
    icon: FileText,
    emoji: '📄',
    title: '소송장 분석',
    subtitle: '계약서·소장 PDF 정밀 분석',
    description: '법률 문서를 업로드하면 독소 조항이나 유리한/불리한 쟁점을 AI가 정밀 분석합니다.',
    color: 'var(--prosecutor)',
    bgGradient: 'linear-gradient(135deg, rgba(224,82,82,0.12) 0%, rgba(224,82,82,0.02) 100%)',
    borderColor: 'rgba(224,82,82,0.35)',
    glowColor: 'rgba(224,82,82,0.2)',
    badge: 'Beta',
    badgeClass: 'badge badge-red',
  },
]

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl mx-auto px-2">
      {MODES.map((mode, i) => {
        const Icon = mode.icon
        const isTrial = mode.id === 'trial'
        
        return (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              y: -8,
              boxShadow: `0 20px 40px -10px ${mode.glowColor}, 0 0 0 1px ${mode.borderColor}`,
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(mode.id)}
            className={`relative text-left p-6 rounded-2xl border cursor-pointer group overflow-hidden flex flex-col h-full ${isTrial ? 'md:-mt-4 md:mb-4 md:scale-105 z-10' : ''}`}
            style={{
              background: mode.bgGradient,
              borderColor: mode.borderColor,
              transition: 'box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${mode.glowColor} 0%, transparent 60%)`,
              }}
            />

            {/* Icon & Badge */}
            <div className="flex items-start justify-between mb-5 relative">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
                style={{
                  background: `${mode.color}15`,
                  border: `1px solid ${mode.color}30`,
                  boxShadow: `0 4px 20px ${mode.color}15`,
                }}
              >
                <Icon size={24} style={{ color: mode.color }} />
              </div>
              <span className={mode.badgeClass}>
                {mode.badge}
              </span>
            </div>

            {/* Content */}
            <div className="relative flex-1">
              <h3
                className="font-bold text-lg mb-1.5"
                style={{ color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif' }}
              >
                {mode.title}
              </h3>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3 opacity-90" style={{ color: mode.color }}>
                {mode.subtitle}
              </p>
              <p className="text-sm leading-relaxed opacity-70" style={{ color: 'var(--text-secondary)' }}>
                {mode.description}
              </p>
            </div>

            {/* CTA */}
            <div
              className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider relative pt-4 border-t border-[rgba(255,255,255,0.05)]"
              style={{ color: mode.color }}
            >
              <span>Start Now</span>
              <motion.span
                className="inline-block"
                transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                animate={{ x: [0, 4] }}
              >
                <ArrowRight size={14} />
              </motion.span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
