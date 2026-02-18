import { motion } from 'framer-motion'
import { Download, Image } from 'lucide-react'

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

function CircularGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32 sm:w-36 sm:h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          {/* Background circle */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke="rgba(201,168,76,0.1)"
            strokeWidth="8"
          />
          {/* Value arc */}
          <motion.circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl sm:text-4xl font-bold"
            style={{ color, fontFamily: 'Playfair Display, serif' }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            {value}
          </motion.span>
          <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>/ 100</span>
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  )
}

function StrengthBar({ label, items, color }: { label: string; items: string[]; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-xs font-bold" style={{ color }}>{label}</span>
      </div>
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 + i * 0.15 }}
          className="text-xs pl-4 py-1.5 rounded-lg"
          style={{ background: `${color}10`, color: 'var(--text-primary)', borderLeft: `2px solid ${color}40` }}
        >
          {item}
        </motion.div>
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
    ? '원고 유리'
    : analysis.favorability === 'defendant'
    ? '피고 유리'
    : '양측 균형'

  // Bar showing relative advantage (plaintiff vs defendant)
  const plaintiffPct = analysis.favorability === 'plaintiff'
    ? Math.min(analysis.confidence, 85)
    : analysis.favorability === 'defendant'
    ? Math.max(100 - analysis.confidence, 15)
    : 50

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(26,30,42,0.95), rgba(13,15,20,0.98))',
        border: '1px solid rgba(201,168,76,0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.1)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
          borderBottom: '1px solid rgba(201,168,76,0.2)',
        }}
      >
        <div className="text-2xl mb-1">⚖️</div>
        <h3
          className="text-lg font-bold"
          style={{ color: 'var(--accent-gold)', fontFamily: 'Playfair Display, serif' }}
        >
          AI 판결 분석
        </h3>
        <div
          className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: `${favorColor}20`, color: favorColor, border: `1px solid ${favorColor}40` }}
        >
          {analysis.ruling} • {favorLabel}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-6">
        {/* Gauge */}
        <div className="flex justify-center">
          <CircularGauge
            value={analysis.confidence}
            label="승소 가능성 (원고 기준)"
            color={favorColor}
          />
        </div>

        {/* Advantage bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span style={{ color: 'var(--prosecutor)' }}>원고 유리</span>
            <span style={{ color: 'var(--defense)' }}>피고 유리</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, var(--prosecutor), var(--defense))`,
              }}
              initial={{ width: '50%' }}
              animate={{ width: `${plaintiffPct}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>

        {/* Key factors */}
        {analysis.keyFactors.length > 0 && (
          <div>
            <h4 className="text-xs font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>
              📌 핵심 쟁점
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {analysis.keyFactors.map((f, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{
                    background: 'rgba(201,168,76,0.1)',
                    color: 'var(--accent-gold-light)',
                    border: '1px solid rgba(201,168,76,0.2)',
                  }}
                >
                  {f}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Strengths comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {analysis.plaintiffStrengths.length > 0 && (
            <StrengthBar
              label="원고 유리 포인트"
              items={analysis.plaintiffStrengths}
              color="var(--prosecutor)"
            />
          )}
          {analysis.defendantStrengths.length > 0 && (
            <StrengthBar
              label="피고 유리 포인트"
              items={analysis.defendantStrengths}
              color="var(--defense)"
            />
          )}
        </div>

        {/* Recommendation */}
        <div
          className="p-3 rounded-xl text-xs leading-relaxed"
          style={{
            background: 'rgba(201,168,76,0.05)',
            border: '1px solid rgba(201,168,76,0.15)',
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{ color: 'var(--accent-gold)' }}>💡 AI 권고: </span>
          {analysis.recommendation}
        </div>

        {/* Download buttons */}
        {(onDownloadPDF || onDownloadImage) && (
          <div className="flex gap-2">
            {onDownloadPDF && (
              <motion.button
                onClick={onDownloadPDF}
                disabled={isExporting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-50"
                style={{
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: 'var(--accent-gold)',
                }}
              >
                <Download size={15} />
                {isExporting ? '저장 중...' : 'PDF'}
              </motion.button>
            )}
            {onDownloadImage && (
              <motion.button
                onClick={onDownloadImage}
                disabled={isExporting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-50"
                style={{
                  background: 'rgba(74,144,217,0.1)',
                  border: '1px solid rgba(74,144,217,0.3)',
                  color: 'var(--defense)',
                }}
              >
                <Image size={15} />
                {isExporting ? '저장 중...' : '이미지'}
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div
        className="px-5 py-2.5 text-[10px] text-center"
        style={{ background: 'rgba(0,0,0,0.2)', color: 'var(--text-muted)' }}
      >
        ⚠️ AI 분석 결과이며 실제 법적 판결이 아닙니다. 전문 변호사 상담을 권장합니다.
      </div>
    </motion.div>
  )
}
