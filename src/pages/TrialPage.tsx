import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw, Gavel, ChevronRight } from 'lucide-react'
import { MessageBubble } from '@/components/MessageBubble'
import { runTrialRound } from '@/services/openai'
import type { Message, CaseType } from '@/types'

interface TrialSetup {
  plaintiffSide: string
  defendantSide: string
  caseType: CaseType
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
    
    // Determine role for this round
    const roleMap: Record<number, 'judge' | 'prosecutor' | 'defense'> = {
      1: 'judge',
      2: 'prosecutor', 
      3: 'defense',
      4: 'judge',
      5: 'prosecutor',
      6: 'defense',
      7: 'judge', // Final verdict
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
              setRound(currentRound + 1)
            }
          } else {
            setMessages(prev =>
              prev.map(m => m.id === streamingId ? { ...m, content: m.content + content } : m)
            )
          }
        }
      )
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === streamingId
          ? { ...m, content: '⚠️ 오류가 발생했습니다.', isStreaming: false }
          : m
        )
      )
      setIsLoading(false)
    }
  }, [setup, messages])

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
    setSetup({ plaintiffSide: '', defendantSide: '', caseType: 'civil' })
  }

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
              AI 판사·검사·변호사 3인이 실제 법정처럼 재판을 진행합니다
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
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--prosecutor)' }}>
              🔴 원고(고소인) 측 주장
            </label>
            <textarea
              value={setup.plaintiffSide}
              onChange={e => setSetup(s => ({ ...s, plaintiffSide: e.target.value }))}
              placeholder="예: 피고는 2024년 3월 계약한 인테리어 공사를 완료하지 않고 계약금 500만원을 돌려주지 않고 있습니다."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(224,82,82,0.3)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--prosecutor)'}
              onBlur={e => e.target.style.borderColor = 'rgba(224,82,82,0.3)'}
            />
          </div>

          {/* Defendant */}
          <div className="mb-8">
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--defense)' }}>
              🔵 피고(피고소인) 측 주장
            </label>
            <textarea
              value={setup.defendantSide}
              onChange={e => setSetup(s => ({ ...s, defendantSide: e.target.value }))}
              placeholder="예: 원고가 추가 공사를 요청하여 비용이 초과되었고, 원고가 먼저 계약을 위반하였습니다."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(74,144,217,0.3)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--defense)'}
              onBlur={e => e.target.style.borderColor = 'rgba(74,144,217,0.3)'}
            />
          </div>

          <button
            onClick={startTrial}
            disabled={!setup.plaintiffSide.trim() || !setup.defendantSide.trim()}
            className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: 'var(--accent-gold)', color: '#1a1208' }}
          >
            <Play size={20} />
            재판 시작
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Court header */}
      <div className="wood-panel px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚖️</span>
          <div>
            <div className="text-xs font-medium" style={{ color: 'var(--accent-gold)' }}>
              {setup.caseType === 'civil' ? '민사' : '형사'} 재판 진행 중
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              라운드 {Math.min(round - 1, 7)} / 7
            </div>
          </div>
        </div>
        <button onClick={resetTrial} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <RotateCcw size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Role indicators */}
      <div className="flex border-b px-4 py-2 gap-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--prosecutor)' }}>
          <div className="w-2 h-2 rounded-full bg-red-500" />
          검사/원고
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--judge)' }}>
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          판사
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--defense)' }}>
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          변호사/피고
        </div>
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
          <div className="text-center">
            <p className="text-sm mb-3" style={{ color: 'var(--accent-gold)' }}>
              ⚖️ 재판이 종결되었습니다
            </p>
            <button
              onClick={resetTrial}
              className="px-6 py-2 rounded-xl text-sm font-medium"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              새 재판 시작
            </button>
          </div>
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
              <><ChevronRight size={18} /> 다음 발언</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
