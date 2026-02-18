import { motion } from 'framer-motion'
import { Scale, Zap, FileText, ArrowRight } from 'lucide-react'
import type { CourtMode } from '@/types'

interface ModeSelectorProps {
  onSelect: (mode: CourtMode) => void
}

const MODES = [
  {
    id: 'quick' as CourtMode,
    icon: Zap,
    emoji: '⚡',
    title: '빠른 법률 상담',
    subtitle: '1분 안에 핵심 정리',
    description: '법률 질문을 입력하면 AI 판사가 핵심 법률 요점, 관련 조항, 권고 행동을 즉시 정리해드립니다.',
    color: '#c9a84c',
    cssColor: 'var(--accent-gold)',
    bgGradient: 'linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 100%)',
    borderColor: 'rgba(201,168,76,0.35)',
    glowColor: 'rgba(201,168,76,0.2)',
    badge: '무료',
    badgeBg: 'rgba(201,168,76,0.15)',
  },
  {
    id: 'trial' as CourtMode,
    icon: Scale,
    emoji: '⚔️',
    title: '가상 재판 시뮬레이션',
    subtitle: 'AI 판사·검사·변호사가 싸운다',
    description: '원고와 피고 양측 주장을 입력하면 AI가 실제 법정처럼 3인 재판을 진행하고 판결을 내립니다.',
    color: '#4a90d9',
    cssColor: 'var(--defense)',
    bgGradient: 'linear-gradient(135deg, rgba(74,144,217,0.12) 0%, rgba(74,144,217,0.04) 100%)',
    borderColor: 'rgba(74,144,217,0.35)',
    glowColor: 'rgba(74,144,217,0.2)',
    badge: '핵심 기능',
    badgeBg: 'rgba(74,144,217,0.15)',
  },
  {
    id: 'document' as CourtMode,
    icon: FileText,
    emoji: '📄',
    title: '소송장 분석',
    subtitle: 'PDF 업로드 → 맞춤 전략',
    description: '소송장, 계약서, 내용증명 등을 업로드하면 AI가 내 입장에서 유불리를 분석하고 전략을 제시합니다.',
    color: '#e05252',
    cssColor: 'var(--prosecutor)',
    bgGradient: 'linear-gradient(135deg, rgba(224,82,82,0.12) 0%, rgba(224,82,82,0.04) 100%)',
    borderColor: 'rgba(224,82,82,0.35)',
    glowColor: 'rgba(224,82,82,0.2)',
    badge: '고급',
    badgeBg: 'rgba(224,82,82,0.15)',
  },
]

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mx-auto px-2">
      {MODES.map((mode, i) => {
        const Icon = mode.icon
        return (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.55 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              scale: 1.03,
              y: -6,
              boxShadow: `0 16px 40px ${mode.glowColor}, 0 0 0 1px ${mode.borderColor}`,
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(mode.id)}
            className="relative text-left p-5 rounded-2xl border cursor-pointer group overflow-hidden"
            style={{
              background: mode.bgGradient,
              borderColor: mode.borderColor,
              transition: 'box-shadow 0.3s ease, transform 0.2s ease',
            }}
          >
            {/* Shimmer overlay on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${mode.glowColor} 0%, transparent 70%)`,
                transition: 'opacity 0.4s ease',
              }}
            />

            {/* Top row: icon + badge */}
            <div className="flex items-start justify-between mb-4 relative">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: `${mode.color}18`,
                  border: `1.5px solid ${mode.color}35`,
                  boxShadow: `0 4px 12px ${mode.color}20`,
                }}
              >
                <Icon size={24} style={{ color: mode.color }} />
              </div>
              <span
                className="text-[11px] px-2.5 py-1 rounded-full font-semibold tracking-wide"
                style={{
                  background: mode.badgeBg,
                  color: mode.color,
                  border: `1px solid ${mode.color}30`,
                }}
              >
                {mode.badge}
              </span>
            </div>

            {/* Title + subtitle */}
            <h3
              className="font-bold text-base mb-1 relative"
              style={{ color: 'var(--text-primary)', fontFamily: 'Noto Sans KR, sans-serif' }}
            >
              {mode.title}
            </h3>
            <p className="text-xs mb-3 font-medium relative" style={{ color: mode.color }}>
              {mode.subtitle}
            </p>

            {/* Description */}
            <p className="text-xs leading-relaxed relative" style={{ color: 'var(--text-secondary)' }}>
              {mode.description}
            </p>

            {/* CTA */}
            <div
              className="mt-4 flex items-center gap-1.5 text-xs font-semibold relative"
              style={{ color: mode.color }}
            >
              <span>시작하기</span>
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight size={13} />
              </motion.span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
