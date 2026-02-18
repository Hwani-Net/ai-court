import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, RotateCcw, Gavel } from 'lucide-react'
import { MessageBubble } from '@/components/MessageBubble'
import { quickConsult } from '@/services/openai'
import type { Message, LegalCategory } from '@/types'
import { LEGAL_CATEGORIES } from '@/types'

export function QuickConsultPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [category, setCategory] = useState<LegalCategory>('other')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
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

    try {
      await quickConsult(input.trim(), category, ({ content, done }) => {
        if (done) {
          setMessages(prev =>
            prev.map(m => m.id === streamingId ? { ...m, isStreaming: false } : m)
          )
          setIsLoading(false)
        } else {
          setMessages(prev =>
            prev.map(m => m.id === streamingId ? { ...m, content: m.content + content } : m)
          )
        }
      })
    } catch (err) {
      setMessages(prev =>
        prev.map(m => m.id === streamingId
          ? { ...m, content: '⚠️ 오류가 발생했습니다. API 키를 확인해주세요.', isStreaming: false }
          : m
        )
      )
      setIsLoading(false)
    }
  }, [input, category, isLoading])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="font-bold text-lg" style={{ color: 'var(--accent-gold)' }}>⚡ 빠른 법률 상담</h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>AI 판사가 핵심 법률 요점을 즉시 정리합니다</p>
        </div>
        <button
          onClick={() => setMessages([])}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          title="대화 초기화"
        >
          <RotateCcw size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 chat-area">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-12"
            >
              <div className="text-5xl mb-4">⚖️</div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                법률 질문을 입력하세요
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                계약, 부동산, 노동, 가족, 형사 등 모든 법률 분야
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((msg, i) => (
          <MessageBubble key={msg.id} message={msg} index={i} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        {/* Category selector */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {(Object.entries(LEGAL_CATEGORIES) as [LegalCategory, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className="text-xs px-3 py-1 rounded-full border transition-all"
              style={{
                borderColor: category === key ? 'var(--accent-gold)' : 'var(--border)',
                background: category === key ? 'rgba(201, 168, 76, 0.15)' : 'transparent',
                color: category === key ? 'var(--accent-gold)' : 'var(--text-muted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Text input */}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="법률 질문을 입력하세요... (예: 집주인이 보증금을 안 돌려줍니다)"
            rows={2}
            className="flex-1 px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-40"
            style={{
              background: 'var(--accent-gold)',
              color: '#1a1208',
            }}
          >
            {isLoading ? <Gavel size={18} className="animate-bounce" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          ⚠️ 이 서비스는 법률 정보 제공 목적이며 실제 법률 자문이 아닙니다
        </p>
      </div>
    </div>
  )
}
