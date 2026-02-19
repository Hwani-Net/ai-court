import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Download, Image, CheckCircle2, AlertCircle } from 'lucide-react'

export interface VerdictAnalysis {
  ruling: string             // "원고 승소" | "피고 승소" | "일부 승소"
  confidence: number         // 0-100
  favorability: 'plaintiff' | 'defendant' | 'neutral'
  keyFactors: string[]       // 핵심 쟁점 목록
  plaintiffStrengths: string[]  // 원고 유리 포인트
  defendantStrengths: string[] // 피고 유리 포인트
  recommendation: string     // 최종 권고
}

interface VerdictCardProps {
  analysis: VerdictAnalysis
  onDownloadPDF?: () => void
  onDownloadImage?: () => void
  isExporting?: boolean
}

// Count-up hook
function useCountUp(target: number, duration = 1400, delay = 500) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const timeout = setTimeout(() => {
      let start = 0
      const step = target / (duration / 16)
      const timer = setInterval(() => {
        start += step
        if (start >= target) { setCount(target); clearInterval(timer) }
        else setCount(Math.floor(start))
      }, 16)
      return () => clearInterval(timer)
    }, delay)
    return () => clearTimeout(timeout)
  }, [inView, target, duration, delay])

  return { count, ref }
}

function CircularGauge({ value, color }: { value: number; color: string }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const { count, ref } = useCountUp(value, 1400, 400)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36 sm:w-40 sm:h-40">
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ boxShadow: `0 0 32px ${color}40, 0 0 64px ${color}20` }}
        />
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          {/* Track */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="10"
          />
          {/* Glow duplicate (blur effect) */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            opacity="0.15"
            style={{ filter: 'blur(4px)' }}
          />
          {/* Main arc */}
          <motion.circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            ref={ref}
            className="text-4xl sm:text-5xl font-bold leading-none"
            style={{ color, fontFamily: 'Playfair Display, serif' }}
          >
            {count}
          </span>
          <span className="text-[10px] mt-1 font-medium tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
            / 100점
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
          승소 가능성 지수
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
          원고 기준
        </div>
      </div>
    </div>
  )
}

function AdvantageBar({ plaintiffPct }: { plaintiffPct: number }) {
  const defendantPct = 100 - plaintiffPct
  const prosecutorColor = 'var(--prosecutor)'
  const defenseColor = 'var(--defense)'

  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-2 font-medium">
        <span style={{ color: prosecutorColor }}>원고 {plaintiffPct}%</span>
        <span className="text-[9px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
          유불리 분석
        </span>
        <span style={{ color: defenseColor }}>피고 {defendantPct}%</span>
      </div>
      <div className="relative w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {/* Plaintiff side */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-l-full"
          style={{ background: `linear-gradient(90deg, ${prosecutorColor}cc, ${prosecutorColor}88)` }}
          initial={{ width: '50%' }}
          animate={{ width: `${plaintiffPct}%` }}
          transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
        />
        {/* Defendant side */}
        <motion.div
          className="absolute right-0 top-0 h-full rounded-r-full"
          style={{ background: `linear-gradient(270deg, ${defenseColor}cc, ${defenseColor}88)` }}
          initial={{ width: '50%' }}
          animate={{ width: `${defendantPct}%` }}
          transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
        />
        {/* Center divider */}
        <div className="absolute left-1/2 top-0 w-0.5 h-full -translate-x-1/2 z-10" style={{ background: 'rgba(0,0,0,0.5)' }} />
      </div>
      {/* Tick marks */}
      <div className="flex justify-between mt-1">
        {[0, 25, 50, 75, 100].map(v => (
          <div key={v} className="flex flex-col items-center gap-0.5">
            <div className="w-px h-1.5" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StrengthItem({ text, color, index }: { text: string; color: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.0 + index * 0.12, ease: 'easeOut' }}
      className="flex items-start gap-2 text-xs py-1.5 px-3 rounded-lg"
      style={{ background: `${color}0d`, borderLeft: `2px solid ${color}50` }}
    >
      <CheckCircle2 size={11} className="flex-shrink-0 mt-0.5" style={{ color }} />
      <span style={{ color: 'rgba(255,255,255,0.75)', lineHeight: '1.4' }}>{text}</span>
    </motion.div>
  )
}

function StrengthSection({ label, items, color, icon }: {
  label: string
  items: string[]
  color: string
  icon: string
}) {
  if (items.length === 0) return null
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">{icon}</span>
        <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color }}>{label}</span>
      </div>
      {items.map((item, i) => (
        <StrengthItem key={i} text={item} color={color} index={i} />
      ))}
    </div>
  )
}

export function VerdictCard({ analysis, onDownloadPDF, onDownloadImage, isExporting }: VerdictCardProps) {
  const favorColor = analysis.favorability === 'plaintiff'
    ? 'var(--prosecutor)'
    : analysis.favorability === 'defendant'
    ? 'var(--defense)'
    : 'var(--accent-gold)'

  const favorLabel = analysis.favorability === 'plaintiff'
    ? '원고 승소 유력'
    : analysis.favorability === 'defendant'
    ? '피고 승소 유력'
    : '양측 균형'

  const favorEmoji = analysis.favorability === 'plaintiff' ? '🔴' : analysis.favorability === 'defendant' ? '🔵' : '⚖️'

  const plaintiffPct = analysis.favorability === 'plaintiff'
    ? Math.min(analysis.confidence, 85)
    : analysis.favorability === 'defendant'
    ? Math.max(100 - analysis.confidence, 15)
    : 50

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(22,26,38,0.98) 0%, rgba(10,12,18,0.99) 100%)',
        border: '1px solid rgba(201,168,76,0.25)',
        boxShadow: '0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.08), 0 0 80px rgba(201,168,76,0.05)',
      }}
    >
      {/* Header */}
      <div
        className="relative px-5 py-5 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.06) 100%)',
          borderBottom: '1px solid rgba(201,168,76,0.18)',
        }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(201,168,76,1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
          className="text-3xl mb-2 relative z-10"
        >
          ⚖️
        </motion.div>
        <h3
          className="text-base font-bold mb-1 relative z-10"
          style={{ color: 'var(--accent-gold)', fontFamily: 'Playfair Display, serif', letterSpacing: '0.05em' }}
        >
          AI 판결 분석 리포트
        </h3>

        {/* Ruling badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full text-sm font-bold relative z-10"
          style={{
            background: `${favorColor}22`,
            color: favorColor,
            border: `1.5px solid ${favorColor}50`,
            boxShadow: `0 0 20px ${favorColor}20`,
          }}
        >
          <span>{favorEmoji}</span>
          <span>{analysis.ruling}</span>
          <span className="text-[10px] opacity-70">·</span>
          <span className="text-[11px] font-medium opacity-80">{favorLabel}</span>
        </motion.div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Gauge */}
        <div className="flex justify-center py-2">
          <CircularGauge value={analysis.confidence} color={favorColor} />
        </div>

        {/* Advantage bar */}
        <AdvantageBar plaintiffPct={plaintiffPct} />

        {/* Divider */}
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Key factors */}
        {analysis.keyFactors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={13} style={{ color: 'var(--accent-gold)' }} />
              <h4 className="text-[11px] font-bold tracking-wider uppercase" style={{ color: 'var(--accent-gold)' }}>
                핵심 쟁점
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.keyFactors.map((f, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.08 }}
                  className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full"
                  style={{
                    background: 'rgba(201,168,76,0.1)',
                    color: 'rgba(201,168,76,0.9)',
                    border: '1px solid rgba(201,168,76,0.2)',
                  }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                    style={{ background: 'rgba(201,168,76,0.25)', color: 'var(--accent-gold)' }}
                  >
                    {i + 1}
                  </span>
                  {f}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Strengths comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StrengthSection
            label="원고 유리 포인트"
            items={analysis.plaintiffStrengths}
            color="var(--prosecutor)"
            icon="🔴"
          />
          <StrengthSection
            label="피고 유리 포인트"
            items={analysis.defendantStrengths}
            color="var(--defense)"
            icon="🔵"
          />
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="p-4 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.03) 100%)',
            border: '1px solid rgba(201,168,76,0.18)',
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">💡</span>
            <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: 'var(--accent-gold)' }}>
              AI 권고사항
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {analysis.recommendation}
          </p>
        </motion.div>

        {/* Download buttons */}
        {(onDownloadPDF || onDownloadImage) && (
          <div className="flex gap-2 pt-1">
            {onDownloadPDF && (
              <motion.button
                onClick={onDownloadPDF}
                disabled={isExporting}
                whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(201,168,76,0.2)' }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-50"
                style={{
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: 'var(--accent-gold)',
                }}
              >
                <Download size={14} />
                {isExporting ? '저장 중...' : 'PDF 저장'}
              </motion.button>
            )}
            {onDownloadImage && (
              <motion.button
                onClick={onDownloadImage}
                disabled={isExporting}
                whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(74,144,217,0.2)' }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-50"
                style={{
                  background: 'rgba(74,144,217,0.1)',
                  border: '1px solid rgba(74,144,217,0.3)',
                  color: 'var(--defense)',
                }}
              >
                <Image size={14} />
                {isExporting ? '저장 중...' : '이미지 저장'}
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Disclaimer — enhanced for trust/liability */}
      <div
        className="px-5 py-3 text-center"
        style={{ background: 'rgba(201,168,76,0.06)', borderTop: '1px solid rgba(201,168,76,0.15)' }}
      >
        <p className="text-[11px] font-medium mb-0.5" style={{ color: 'rgba(201,168,76,0.7)' }}>
          ⚠️ 본 분석은 참고용 AI 시뮬레이션이며 실제 법원 판결이 아닙니다
        </p>
        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
          승소 확률은 유사 사례 기반 추정치입니다. 실제 소송 전 반드시 전문 변호사와 상담하세요.
        </p>
      </div>
    </motion.div>
  )
}
