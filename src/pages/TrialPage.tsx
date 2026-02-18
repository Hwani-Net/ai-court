import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw, Gavel, ChevronRight } from 'lucide-react'
import { MessageBubble } from '@/components/MessageBubble'
import { CourtRoom } from '@/components/CourtRoom'
import { ShareButton } from '@/components/ShareButton'
import { VerdictCard, type VerdictAnalysis } from '@/components/VerdictCard'
import { runTrialRound, analyzeVerdict } from '@/services/openai'
import { usePDFExport } from '@/hooks/usePDFExport'
import type { Message, CaseType } from '@/types'

interface TrialSetup {
  plaintiffSide: string
  defendantSide: string
  caseType: CaseType
}

// Round label map
const ROUND_LABELS: Record<number, { label: string; role: string; color: string }> = {
  1: { label: '개정', role: '판사', color: '#c9a84c' },
  2: { label: '원고 주장', role: '검사/원고', color: '#ef4444' },
  3: { label: '피고 반박', role: '변호사/피고', color: '#3b82f6' },
  4: { label: '쟁점 정리', role: '판사', color: '#c9a84c' },
  5: { label: '원고 재반박', role: '검사/원고', color: '#ef4444' },
  6: { label: '피고 최후 변론', role: '변호사/피고', color: '#3b82f6' },
  7: { label: '최종 판결', role: '판사', color: '#c9a84c' },
}

export function TrialPage() {
  const { verdictRef, downloadPDF, downloadImage, isExporting } = usePDFExport()
  const [phase, setPhase] = useState<'setup' | 'trial'>('setup')
  const [setup, setSetup] = useState<TrialSetup>({
    plaintiffSide: '',
    defendantSide: '',
    caseType: 'civil',
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [round, setRound] = useState(1)
  const [activeRole, setActiveRole] = useState<'judge' | 'prosecutor' | 'defense' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
  const [verdictAnalysis, setVerdictAnalysis] = useState<VerdictAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startTrial = useCallback(async () => {
    if (!setup.plaintiffSide.trim() || !setup.defendantSide.trim()) return
    setPhase('trial')
    await runRound(1)
  }, [setup])

  const runRound = useCallback(async (currentRound: number) => {
    setIsLoading(true)
    const streamingId = Date.now().toString()

    const roleMap: Record<number, 'judge' | 'prosecutor' | 'defense'> = {
      1: 'judge', 2: 'prosecutor', 3: 'defense',
      4: 'judge', 5: 'prosecutor', 6: 'defense', 7: 'judge',
    }
    const role = roleMap[currentRound] || 'judge'
    setActiveRole(role)

    const streamingMsg: Message = {
      id: streamingId,
      role,
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages(prev => [...prev, streamingMsg])

    const caseDesc = `원고 측 주장: ${setup.plaintiffSide}\n피고 측 주장: ${setup.defendantSide}`

    try {
      await runTrialRound(
        caseDesc,
        setup.caseType,
        currentRound,
        messages,
        ({ content, done }) => {
          if (done) {
            setMessages(prev =>
              prev.map(m => m.id === streamingId ? { ...m, isStreaming: false } : m)
            )
            setIsLoading(false)
            if (currentRound >= 7) {
              setIsFinished(true)
              // Auto-trigger structured verdict analysis
              setIsAnalyzing(true)
              setMessages(prev => {
                analyzeVerdict(prev, setup.caseType)
                  .then(result => setVerdictAnalysis(result))
                  .finally(() => setIsAnalyzing(false))
                return prev
              })
            } else {
              const nextRound = currentRound + 1
              setRound(nextRound)
            }
          } else {
            setMessages(prev =>
              prev.map(m => m.id === streamingId ? { ...m, content: m.content + content } : m)
            )
          }
        }
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류'
      setMessages(prev =>
        prev.map(m => m.id === streamingId
          ? { ...m, content: `⚠️ ${errorMessage}`, isStreaming: false }
          : m
        )
      )
      setIsLoading(false)
    }
  }, [setup, messages])

  // Auto-play: when round changes and autoPlay is on, auto-advance
  useEffect(() => {
    if (autoPlay && phase === 'trial' && !isLoading && !isFinished && round > 1) {
      const timer = setTimeout(() => runRound(round), 800)
      return () => clearTimeout(timer)
    }
  }, [round, autoPlay, phase, isLoading, isFinished])

  const handleNextRound = () => {
    if (!isLoading && round <= 7) {
      runRound(round)
    }
  }

  const resetTrial = () => {
    setPhase('setup')
    setMessages([])
    setRound(1)
    setIsFinished(false)
    setAutoPlay(true)
    setActiveRole(null)
    setVerdictAnalysis(null)
    setIsAnalyzing(false)
    setSetup({ plaintiffSide: '', defendantSide: '', caseType: 'civil' })
  }

  // ── Setup Phase ──────────────────────────────────────────────────────────
  if (phase === 'setup') {
    const SCENARIOS = [
      {
        emoji: '🏠',
        title: '임대차 보증금 반환',
        tag: '민사',
        tagColor: 'var(--accent-gold)',
        tagBg: 'rgba(201,168,76,0.12)',
        borderHover: 'rgba(201,168,76,0.4)',
        setup: {
          caseType: 'civil' as CaseType,
          plaintiffSide: '집주인이 계약이 종료되었음에도 불구하고 다음 세입자가 들어오지 않았다는 이유로 보증금 5,000만원을 3개월째 돌려주지 않고 있습니다. 전세금 반환 및 이자 청구를 원합니다.',
          defendantSide: '역전세난으로 인해 당장 현금이 부족합니다. 새로운 세입자를 구하기 위해 최선을 다하고 있으며, 보증금이 마련되는 대로 지연 이자와 함께 지급할 예정입니다.',
        },
      },
      {
        emoji: '📱',
        title: '중고거래 택배 사기',
        tag: '형사',
        tagColor: 'var(--prosecutor)',
        tagBg: 'rgba(224,82,82,0.12)',
        borderHover: 'rgba(224,82,82,0.4)',
        setup: {
          caseType: 'criminal' as CaseType,
          plaintiffSide: '당근마켓에서 아이폰 15를 100만원에 구매하기로 하고 입금했는데, 판매자가 벽돌이 든 택배를 보낸 후 연락을 두절했습니다. 사기죄로 강력한 처벌을 원합니다.',
          defendantSide: '포장 과정에서 실수가 있었던 것이지 사기의 고의는 없었습니다. 상품은 현재 다시 배송 중이며, 단순 배송 지연일 뿐입니다.',
        },
      },
    ]

    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-5 pb-8"
          style={{ maxWidth: '48rem', margin: '0 auto' }}
        >
          {/* Header */}
          <div className="text-center mb-7">
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.2) 0%, rgba(201,168,76,0.05) 100%)',
                  border: '1.5px solid rgba(201,168,76,0.4)',
                  boxShadow: '0 0 30px rgba(201,168,76,0.12)',
                }}
              >
                <span className="text-3xl">⚔️</span>
              </motion.div>
            </div>
            <h2 className="text-xl font-bold mb-1.5" style={{ color: 'var(--accent-gold)', fontFamily: 'Playfair Display, serif' }}>
              가상 재판 시뮬레이션
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              AI 판사·검사·변호사 3인이 실제 법정처럼 7라운드 재판을 진행합니다
            </p>
          </div>

          {/* Case type */}
          <div className="mb-5">
            <label className="text-xs font-semibold mb-2 block tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
              사건 유형
            </label>
            <div className="flex gap-3">
              {(['civil', 'criminal'] as CaseType[]).map(type => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSetup(s => ({ ...s, caseType: type }))}
                  className="flex-1 py-3 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    borderColor: setup.caseType === type ? 'var(--accent-gold)' : 'var(--border)',
                    background: setup.caseType === type ? 'rgba(201,168,76,0.12)' : 'var(--bg-card)',
                    color: setup.caseType === type ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    boxShadow: setup.caseType === type ? '0 0 16px rgba(201,168,76,0.15)' : 'none',
                  }}
                >
                  {type === 'civil' ? '⚖️ 민사 사건' : '🔴 형사 사건'}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Plaintiff */}
          <div className="mb-4">
            <label className="text-xs font-semibold mb-2 flex items-center gap-1.5 tracking-wider uppercase" style={{ color: 'var(--prosecutor)' }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--prosecutor)' }} />
              원고(고소인) 측 주장
            </label>
            <textarea
              value={setup.plaintiffSide}
              onChange={e => setSetup(s => ({ ...s, plaintiffSide: e.target.value }))}
              placeholder="예: 피고는 2024년 3월 계약한 인테리어 공사를 완료하지 않고 계약금 500만원을 돌려주지 않고 있습니다."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(224,82,82,0.25)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--prosecutor)'}
              onBlur={e => e.target.style.borderColor = 'rgba(224,82,82,0.25)'}
            />
          </div>

          {/* VS divider */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>VS</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Defendant */}
          <div className="mb-6">
            <label className="text-xs font-semibold mb-2 flex items-center gap-1.5 tracking-wider uppercase" style={{ color: 'var(--defense)' }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--defense)' }} />
              피고(피고소인) 측 주장
            </label>
            <textarea
              value={setup.defendantSide}
              onChange={e => setSetup(s => ({ ...s, defendantSide: e.target.value }))}
              placeholder="예: 원고가 추가 공사를 요청하여 비용이 초과되었고, 원고가 먼저 계약을 위반하였습니다."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(74,144,217,0.25)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--defense)'}
              onBlur={e => e.target.style.borderColor = 'rgba(74,144,217,0.25)'}
            />
          </div>

          {/* Start button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(201,168,76,0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={startTrial}
            disabled={!setup.plaintiffSide.trim() || !setup.defendantSide.trim()}
            className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: 'var(--accent-gold)', color: '#1a1208' }}
          >
            <Play size={20} />
            재판 시작
          </motion.button>

          {/* Scenarios */}
          <div className="mt-6">
            <p className="text-xs font-semibold mb-3 tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
              추천 시나리오
            </p>
            <div className="grid grid-cols-2 gap-3">
              {SCENARIOS.map(sc => (
                <motion.button
                  key={sc.title}
                  whileHover={{ scale: 1.02, borderColor: sc.borderHover, boxShadow: `0 4px 16px ${sc.tagBg}` }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSetup(sc.setup)}
                  className="p-3 rounded-xl text-left transition-all border"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base">{sc.emoji}</span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: sc.tagBg, color: sc.tagColor }}
                    >
                      {sc.tag}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{sc.title}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Round timeline info */}
          <div className="mt-6">
            <p className="text-xs font-semibold mb-3 tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
              재판 진행 순서
            </p>
            <div className="flex items-center gap-0">
              {Object.entries(ROUND_LABELS).map(([r, info]) => {
                const roleColor = info.color
                return (
                  <div key={r} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{ background: `${roleColor}20`, border: `1.5px solid ${roleColor}60`, color: roleColor }}
                      >
                        {r}
                      </div>
                      <div className="text-[8px] text-center whitespace-nowrap" style={{ color: 'var(--text-muted)', maxWidth: '36px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {info.label}
                      </div>
                    </div>
                    {Number(r) < 7 && (
                      <div className="flex-1 h-px mx-0.5" style={{ background: 'var(--border)' }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Trial Phase ──────────────────────────────────────────────────────────
  const completedRounds = Math.min(round - 1, 7)

  return (
    <div className="flex flex-col h-full">
      {/* Court header */}
      <div className="wood-panel px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">⚖️</span>
          <div>
            <div className="text-xs font-bold" style={{ color: 'var(--accent-gold)' }}>
              {setup.caseType === 'civil' ? '민사' : '형사'} 재판
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {completedRounds} / 7 라운드 완료
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isFinished && <ShareButton text="AI Court에서 가상 재판을 해봤어요! 판결 결과가 놀라워요 😮" />}
          <button onClick={resetTrial} className="p-2 rounded-lg hover:bg-white/5 transition-colors" title="새 재판">
            <RotateCcw size={15} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Courtroom visual (includes round timeline) */}
      <CourtRoom activeRole={activeRole} currentRound={round > 7 ? 7 : round} isLoading={isLoading} />

      {/* Auto-play & current speaker banner */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        {!isFinished && round <= 7 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={round}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{
                  background: 'rgba(201,168,76,0.1)',
                  color: 'var(--accent-gold)',
                  border: '1px solid rgba(201,168,76,0.2)',
                }}
              >
                R{round} · {ROUND_LABELS[round]?.label}
              </motion.div>
            </AnimatePresence>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className="text-xs px-2.5 py-1 rounded-lg transition-all font-medium"
              style={{
                background: autoPlay ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                color: autoPlay ? '#4ade80' : 'var(--text-muted)',
                border: `1px solid ${autoPlay ? 'rgba(74,222,128,0.25)' : 'var(--border)'}`,
              }}
            >
              {autoPlay ? '▶ 자동 진행' : '⏸ 수동 진행'}
            </button>
          </>
        ) : (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-medium"
            style={{ color: isFinished ? 'var(--accent-gold)' : 'var(--text-muted)' }}
          >
            {isFinished ? '⚖️ 재판 종결' : '재판 진행 중'}
          </motion.span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 chat-area">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id} message={msg} index={i} />
          ))}
        </AnimatePresence>
        {/* Verdict Analysis Card */}
        {isFinished && (isAnalyzing || verdictAnalysis) && (
          <div className="px-2 py-4">
            {isAnalyzing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="text-3xl mb-3 animate-pulse">⚖️</div>
                <p className="text-sm" style={{ color: 'var(--accent-gold)' }}>판결을 분석하고 있습니다...</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>AI가 승소 확률과 핵심 쟁점을 정리합니다</p>
              </motion.div>
            ) : verdictAnalysis && (
              <div ref={verdictRef}>
                <VerdictCard
                  analysis={verdictAnalysis}
                  onDownloadPDF={downloadPDF}
                  onDownloadImage={downloadImage}
                  isExporting={isExporting}
                />
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Controls */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        {isFinished ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {/* Verdict banner */}
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(201,168,76,0)', '0 0 20px rgba(201,168,76,0.25)', '0 0 0px rgba(201,168,76,0)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="py-3 px-4 rounded-xl flex items-center gap-3"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.35)' }}
            >
              <span className="text-2xl">⚖️</span>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--accent-gold)' }}>재판이 종결되었습니다</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>위의 판결문을 확인하세요</p>
              </div>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={resetTrial}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              🔄 새 재판 시작
            </motion.button>
          </motion.div>
        ) : (
          <motion.button
            whileHover={!isLoading ? { scale: 1.01, boxShadow: '0 4px 16px rgba(201,168,76,0.2)' } : {}}
            whileTap={!isLoading ? { scale: 0.99 } : {}}
            onClick={handleNextRound}
            disabled={isLoading || round > 7}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid var(--border-strong)', color: 'var(--accent-gold)' }}
          >
            {isLoading ? (
              <><Gavel size={18} className="animate-bounce" /> 발언 중...</>
            ) : (
              <><ChevronRight size={18} /> 다음 발언 ({ROUND_LABELS[round]?.label})</>
            )}
          </motion.button>
        )}
      </div>
    </div>
  )
}
