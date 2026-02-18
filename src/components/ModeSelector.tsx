import { motion } from 'framer-motion'
import { Scale, Zap, FileText } from 'lucide-react'
import type { CourtMode } from '@/types'

interface ModeSelectorProps {
  onSelect: (mode: CourtMode) => void
}

const MODES = [
  {
    id: 'quick' as CourtMode,
    icon: Zap,
    title: '빠른 법률 상담',
    subtitle: '1분 안에 핵심 정리',
    description: '법률 질문을 입력하면 AI 판사가 핵심 법률 요점, 관련 조항, 권고 행동을 즉시 정리해드립니다.',
    color: 'var(--accent-gold)',
    bgColor: 'rgba(201, 168, 76, 0.08)',
    borderColor: 'rgba(201, 168, 76, 0.3)',
    badge: '무료',
  },
  {
    id: 'trial' as CourtMode,
    icon: Scale,
    title: '가상 재판 시뮬레이션',
    subtitle: 'AI 판사·검사·변호사가 싸운다',
    description: '원고와 피고 양측 주장을 입력하면 AI가 실제 법정처럼 3인 재판을 진행하고 판결을 내립니다.',
    color: 'var(--defense)',
    bgColor: 'rgba(74, 144, 217, 0.08)',
    borderColor: 'rgba(74, 144, 217, 0.3)',
    badge: '핵심 기능',
  },
  {
    id: 'document' as CourtMode,
    icon: FileText,
    title: '소송장 분석',
    subtitle: 'PDF 업로드 → 맞춤 시나리오',
    description: '소송장, 계약서, 내용증명 등을 업로드하면 AI가 내 입장에서 유불리를 분석하고 전략을 제시합니다.',
    color: 'var(--prosecutor)',
    bgColor: 'rgba(224, 82, 82, 0.08)',
    borderColor: 'rgba(224, 82, 82, 0.3)',
    badge: '고급',
  },
]

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
      {MODES.map((mode, i) => {
        const Icon = mode.icon
        return (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(mode.id)}
            className="text-left p-6 rounded-xl border transition-all duration-300 cursor-pointer group"
            style={{
              background: mode.bgColor,
              borderColor: mode.borderColor,
            }}
          >
            {/* Badge */}
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${mode.color}20`, border: `1px solid ${mode.color}40` }}
              >
                <Icon size={20} style={{ color: mode.color }} />
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{ background: `${mode.color}20`, color: mode.color }}
              >
                {mode.badge}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              {mode.title}
            </h3>
            <p className="text-xs mb-3" style={{ color: mode.color }}>
              {mode.subtitle}
            </p>

            {/* Description */}
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {mode.description}
            </p>

            {/* Arrow */}
            <div
              className="mt-4 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: mode.color }}
            >
              시작하기 →
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
