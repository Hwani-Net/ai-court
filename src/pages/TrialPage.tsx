import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw, Gavel, ChevronRight } from 'lucide-react'
import { MessageBubble } from '@/components/MessageBubble'
import { ShareButton } from '@/components/ShareButton'
import { runTrialRound } from '@/services/openai'
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
  const [phase, setPhase] = useState<'setup' | 'trial'>('setup')
  const [setup, setSetup] = useState<TrialSetup>({
    plaintiffSide: '',
    defendantSide: '',
    caseType: 'civil',
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [round, setRound] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
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
    setSetup({ plaintiffSide: '', defendantSide: '', caseType: 'civil' })
  }

  // ── Setup Phase ──────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="flex flex-col h-full p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto w-full"
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">⚔️</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)', fontFamily: 'Playfair Display, serif' }}>
              가상 재판 시뮬레이션
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              AI 판사·검사·변호사 3인이 실제 법정처럼 7라운드 재판을 진행합니다
            </p>
          </div>

          {/* Case type */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              사건 유형
            </label>
            <div className="flex gap-3">
              {(['civil', 'criminal'] as CaseType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setSetup(s => ({ ...s, caseType: type }))}
                  className="flex-1 py-3 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    borderColor: setup.caseType === type ? 'var(--accent-gold)' : 'var(--border)',
                    background: setup.caseType === type ? 'rgba(201,168,76,0.1)' : 'var(--bg-card)',
                    color: setup.caseType === type ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  }}
                >
                  {type === 'civil' ? '⚖️ 민사 사건' : '🔴 형사 사건'}
                </button>
              ))}
            </div>
          </div>

          {/* Plaintiff */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 flex items-center gap-1" style={{ color: '#ef4444' }}>
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              원고(고소인) 측 주장
            </label>
            <textarea
              value={setup.plaintiffSide}
              onChange={e => setSetup(s => ({ ...s, plaintiffSide: e.target.value }))}
              placeholder="예: 피고는 2024년 3월 계약한 인테리어 공사를 완료하지 않고 계약금 500만원을 돌려주지 않고 있습니다."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => e.target.style.borderColor = '#ef4444'}
              onBlur={e => e.target.style.borderColor = 'rgba(239,68,68,0.3)'}
            />
          </div>

          {/* Defendant */}
          <div className="mb-8">
            <label className="text-sm font-medium mb-2 flex items-center gap-1" style={{ color: '#3b82f6' }}>
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              피고(피고소인) 측 주장
            </label>
            <textarea
              value={setup.defendantSide}
              onChange={e => setSetup(s => ({ ...s, defendantSide: e.target.value }))}
              placeholder="예: 원고가 추가 공사를 요청하여 비용이 초과되었고, 원고가 먼저 계약을 위반하였습니다."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(59,130,246,0.3)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = 'rgba(59,130,246,0.3)'}
            />
          </div>

          <button
            onClick={startTrial}
            disabled={!setup.plaintiffSide.trim() || !setup.defendantSide.trim()}
            className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-40 hover:opacity-90"
            style={{ background: 'var(--accent-gold)', color: '#1a1208' }}
          >
            <Play size={20} />
            재판 시작
          </button>

          {/* Quick Examples */}
          <div className="mt-8">
            <p className="text-xs font-medium mb-3 text-center" style={{ color: 'var(--text-muted)' }}>
              테스트용 추천 시나리오
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSetup({
                  caseType: 'civil',
                  plaintiffSide: '집주인이 계약이 종료되었음에도 불구하고 다음 세입자가 들어오지 않았다는 이유로 보증금 5,000만원을 3개월째 돌려주지 않고 있습니다. 전세금 반환 및 이자 청구를 원합니다.',
                  defendantSide: '역전세난으로 인해 당장 현금이 부족합니다. 새로운 세입자를 구하기 위해 최선을 다하고 있으며, 보증금이 마련되는 대로 지연 이자와 함께 지급할 예정입니다.'
                })}
                className="p-3 rounded-lg text-left text-[11px] leading-tight transition-all hover:bg-white/5 border"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
              >
                🏠 임대차 보증금 반환 분쟁
              </button>
              <button
                onClick={() => setSetup({
                  caseType: 'criminal',
                  plaintiffSide: '당근마켓에서 아이폰 15를 100만원에 구매하기로 하고 입금했는데, 판매자가 벽돌이 든 택배를 보낸 후 연락을 두절했습니다. 사기죄로 강력한 처벌을 원합니다.',
                  defendantSide: '포장 과정에서 실수가 있었던 것이지 사기의 고의는 없었습니다. 상품은 현재 다시 배송 중이며, 단순 배송 지연일 뿐입니다.'
                })}
                className="p-3 rounded-lg text-left text-[11px] leading-tight transition-all hover:bg-white/5 border"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
              >
                📱 중고거래 택배 사기 사건
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 grid grid-cols-4 gap-3 text-center">
            {Object.entries(ROUND_LABELS).map(([r, info]) => (
              <div key={r} className="p-2 rounded-lg text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="font-bold mb-0.5" style={{ color: info.color }}>R{r}</div>
                <div style={{ color: 'var(--text-muted)' }}>{info.label}</div>
              </div>
            ))}
            <div className="p-2 rounded-lg text-xs" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <div className="font-bold mb-0.5" style={{ color: 'var(--accent-gold)' }}>⚖️</div>
              <div style={{ color: 'var(--text-muted)' }}>판결</div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Trial Phase ──────────────────────────────────────────────────────────
  const completedRounds = Math.min(round - 1, 7)
  const progressPct = (completedRounds / 7) * 100

  return (
    <div className="flex flex-col h-full">
      {/* Court header */}
      <div className="wood-panel px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚖️</span>
          <div>
            <div className="text-xs font-medium" style={{ color: 'var(--accent-gold)' }}>
              {setup.caseType === 'civil' ? '민사' : '형사'} 재판 진행 중
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              라운드 {completedRounds} / 7
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

      {/* Progress bar */}
      <div className="h-0.5 w-full" style={{ background: 'var(--border)' }}>
        <motion.div
          className="h-full"
          style={{ background: 'var(--accent-gold)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Role indicators */}
      <div className="flex border-b px-4 py-2 gap-4" style={{ borderColor: 'var(--border)' }}>
        {[
          { color: '#ef4444', dot: 'bg-red-500', label: '검사/원고' },
          { color: '#c9a84c', dot: 'bg-yellow-500', label: '판사' },
          { color: '#3b82f6', dot: 'bg-blue-500', label: '변호사/피고' },
        ].map(r => (
          <div key={r.label} className="flex items-center gap-1 text-xs" style={{ color: r.color }}>
            <div className={`w-1.5 h-1.5 rounded-full ${r.dot}`} />
            {r.label}
          </div>
        ))}
        {!isFinished && round <= 7 && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className="text-xs px-2 py-0.5 rounded transition-all"
              style={{
                background: autoPlay ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
                color: autoPlay ? '#4ade80' : 'var(--text-muted)',
                border: `1px solid ${autoPlay ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
              }}
            >
              {autoPlay ? '▶ 자동' : '⏸ 수동'}
            </button>
            <div className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--accent-gold)', border: '1px solid rgba(201,168,76,0.2)' }}>
              다음: {ROUND_LABELS[round]?.label}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 chat-area">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id} message={msg} index={i} />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Controls */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        {isFinished ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            {/* Verdict banner */}
            <div
              className="py-3 px-4 rounded-xl"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}
            >
              <div className="text-2xl mb-1">⚖️</div>
              <p className="text-sm font-bold" style={{ color: 'var(--accent-gold)' }}>
                재판이 종결되었습니다
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                위의 판결문을 확인하세요
              </p>
            </div>
            <button
              onClick={resetTrial}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              🔄 새 재판 시작
            </button>
          </motion.div>
        ) : (
          <button
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
          </button>
        )}
      </div>
    </div>
  )
}
