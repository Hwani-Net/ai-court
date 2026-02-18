import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, RotateCcw, Gavel } from 'lucide-react'
import { MessageBubble } from '@/components/MessageBubble'
import { ShareButton } from '@/components/ShareButton'
import { quickConsult } from '@/services/openai'
import type { Message, LegalCategory } from '@/types'
import { LEGAL_CATEGORIES } from '@/types'
import { trackQuickConsultStart, trackQuickConsultComplete } from '@/utils/analytics'

// Category emoji map
const CATEGORY_EMOJI: Record<LegalCategory, string> = {
  contract: '📝',
  property: '🏠',
  labor: '💼',
  family: '👨‍👩‍👧',
  criminal: '🔴',
  consumer: '🛒',
  traffic: '🚗',
  other: '⚖️',
}

// Example questions with category
const EXAMPLE_QUESTIONS: { q: string; category: LegalCategory; color: string }[] = [
  {
    q: '집주인이 보증금 3000만원을 2개월째 안 돌려줍니다',
    category: 'property',
    color: 'rgba(201,168,76,0.8)',
  },
  {
    q: '퇴직금을 제대로 못 받았는데 어떻게 해야 하나요?',
    category: 'labor',
    color: 'rgba(74,144,217,0.8)',
  },
  {
    q: '온라인 쇼핑몰에서 환불 거부당했습니다',
    category: 'consumer',
    color: 'rgba(74,222,128,0.8)',
  },
]

export function QuickConsultPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [category, setCategory] = useState<LegalCategory>('other')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = useCallback(async (overrideInput?: string, overrideCategory?: LegalCategory) => {
    const query = (overrideInput ?? input).trim()
    const cat = overrideCategory ?? category
    if (!query || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    }

    const streamingId = (Date.now() + 1).toString()
    const streamingMsg: Message = {
      id: streamingId,
      role: 'judge',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages(prev => [...prev, userMsg, streamingMsg])
    setInput('')
    setIsLoading(true)
    trackQuickConsultStart(cat)

    try {
      await quickConsult(query, cat, ({ content, done }) => {
        if (done) {
          setMessages(prev =>
            prev.map(m => m.id === streamingId ? { ...m, isStreaming: false } : m)
          )
          setIsLoading(false)
          trackQuickConsultComplete(cat)
        } else {
          setMessages(prev =>
            prev.map(m => m.id === streamingId ? { ...m, content: m.content + content } : m)
          )
        }
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '⚠️ 알 수 없는 오류가 발생했습니다.'
      setMessages(prev =>
        prev.map(m => m.id === streamingId
          ? { ...m, content: `⚠️ ${errorMessage}`, isStreaming: false }
          : m
        )
      )
      setIsLoading(false)
    }
  }, [input, category, isLoading])

  const charCount = input.length
  const maxChars = 500

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b w-full"
        style={{ borderColor: 'var(--border)', background: 'transparent', maxWidth: '64rem', margin: '0 auto' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(201,168,76,0.2) 0%, rgba(201,168,76,0.05) 100%)',
              border: '1.5px solid rgba(201,168,76,0.35)',
            }}
          >
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <h2 className="font-bold text-sm" style={{ color: 'var(--accent-gold)' }}>
              빠른 법률 상담
            </h2>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              AI 판사가 핵심 법률 요점을 즉시 정리합니다
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && <ShareButton text="AI Court에서 법률 상담을 받았어요! 무료로 체험해보세요." />}
          <button
            onClick={() => setMessages([])}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            title="대화 초기화"
          >
            <RotateCcw size={15} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Loading banner */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center justify-center gap-2 py-2 text-xs font-medium"
              style={{
                background: 'linear-gradient(90deg, rgba(201,168,76,0.08), rgba(201,168,76,0.15), rgba(201,168,76,0.08))',
                color: 'var(--accent-gold)',
                borderBottom: '1px solid rgba(201,168,76,0.15)',
              }}
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="text-sm"
              >
                ⚖️
              </motion.span>
              AI 판사가 법률을 분석하고 있습니다...
              <span className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="w-1 h-1 rounded-full inline-block"
                    style={{ background: 'var(--accent-gold)' }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
                  />
                ))}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-area">
        <div className="px-6 py-4" style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center py-8"
            >
              {/* Icon box */}
              <div className="flex justify-center mb-4">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.4 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.05) 100%)',
                    border: '1.5px solid rgba(201,168,76,0.35)',
                    boxShadow: '0 0 30px rgba(201,168,76,0.1)',
                  }}
                >
                  <span className="text-3xl">⚖️</span>
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-sm font-medium mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                법률 질문을 입력하세요
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xs mb-6"
                style={{ color: 'var(--text-muted)' }}
              >
                계약 · 부동산 · 노동 · 가족 · 형사 등 모든 법률 분야
              </motion.p>

              {/* Example question cards */}
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {EXAMPLE_QUESTIONS.map(({ q, category: cat, color }, i) => (
                  <motion.button
                    key={q}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.08 }}
                    whileHover={{ scale: 1.02, borderColor: color, boxShadow: `0 4px 16px ${color}20` }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCategory(cat)
                      handleSubmit(q, cat)
                    }}
                    className="flex items-start gap-3 p-3 rounded-xl text-left border transition-all"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                  >
                    <span
                      className="text-base flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${color}15` }}
                    >
                      {CATEGORY_EMOJI[cat]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-[9px] font-semibold tracking-wider uppercase mb-0.5"
                        style={{ color }}
                      >
                        {LEGAL_CATEGORIES[cat]}
                      </div>
                      <div className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
                        {q}
                      </div>
                    </div>
                    <span className="text-sm flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>›</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((msg, i) => (
          <MessageBubble key={msg.id} message={msg} index={i} />
        ))}
        <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="px-6 py-3" style={{ maxWidth: '64rem', margin: '0 auto' }}>
        {/* Category selector */}
        <div className="flex gap-1.5 mb-2.5 overflow-x-auto pb-1 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
          {(Object.entries(LEGAL_CATEGORIES) as [LegalCategory, string][]).map(([key, label]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(key)}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all whitespace-nowrap flex-shrink-0"
              style={{
                borderColor: category === key ? 'var(--accent-gold)' : 'var(--border)',
                background: category === key ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: category === key ? 'var(--accent-gold)' : 'var(--text-muted)',
                boxShadow: category === key ? '0 0 10px rgba(201,168,76,0.15)' : 'none',
              }}
            >
              <span className="text-[11px]">{CATEGORY_EMOJI[key]}</span>
              {label}
            </motion.button>
          ))}
        </div>

        {/* Text input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value.slice(0, maxChars))}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder="법률 질문을 입력하세요... (예: 집주인이 보증금을 안 돌려줍니다)"
              rows={2}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all disabled:opacity-60"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                paddingBottom: '20px',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--accent-gold)'
                e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.08)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.boxShadow = 'none'
              }}
            />
            {/* Char counter */}
            {charCount > 0 && (
              <div
                className="absolute bottom-2 right-3 text-[10px]"
                style={{ color: charCount > maxChars * 0.9 ? 'var(--prosecutor)' : 'var(--text-muted)' }}
              >
                {charCount}/{maxChars}
              </div>
            )}
          </div>

          <motion.button
            whileHover={!isLoading && input.trim() ? { scale: 1.05, boxShadow: '0 4px 16px rgba(201,168,76,0.35)' } : {}}
            whileTap={!isLoading && input.trim() ? { scale: 0.95 } : {}}
            onClick={() => handleSubmit()}
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-40 self-start"
            style={{
              background: 'var(--accent-gold)',
              color: '#1a1208',
            }}
          >
            {isLoading
              ? <Gavel size={18} className="animate-bounce" />
              : <Send size={18} />
            }
          </motion.button>
        </div>

        <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
          ⚠️ 이 서비스는 법률 정보 제공 목적이며 실제 법률 자문이 아닙니다
        </p>
        </div>
      </div>
    </div>
  )
}
