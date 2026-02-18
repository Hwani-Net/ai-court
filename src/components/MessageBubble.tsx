import { motion } from 'framer-motion'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  index: number
}

// Simple markdown-like renderer for legal content
function renderContent(content: string, role: string) {
  if (!content) return null

  // Detect verdict pattern [주문] / [이유] / [권고사항]
  const isVerdict = content.includes('[주문]') || content.includes('[이유]') || content.includes('[권고사항]')

  if (isVerdict && role === 'judge') {
    const sections = content
      .split(/(\[주문\]|\[이유\]|\[권고사항\])/)
      .filter(Boolean)

    const parts: { label?: string; text: string }[] = []
    let currentLabel = ''
    for (const s of sections) {
      if (s === '[주문]' || s === '[이유]' || s === '[권고사항]') {
        currentLabel = s
      } else {
        parts.push({ label: currentLabel || undefined, text: s.trim() })
        currentLabel = ''
      }
    }

    const labelColors: Record<string, string> = {
      '[주문]': '#c9a84c',
      '[이유]': '#94a3b8',
      '[권고사항]': '#4ade80',
    }

    return (
      <div className="space-y-3">
        {parts.map((part, i) => (
          <div key={i}>
            {part.label && (
              <div
                className="text-xs font-bold mb-1 px-2 py-0.5 rounded inline-block"
                style={{
                  color: labelColors[part.label] || 'var(--accent-gold)',
                  background: `${labelColors[part.label] || '#c9a84c'}20`,
                  border: `1px solid ${labelColors[part.label] || '#c9a84c'}40`,
                }}
              >
                {part.label}
              </div>
            )}
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {part.text}
            </p>
          </div>
        ))}
      </div>
    )
  }

  // Numbered list detection (1. 2. 3.)
  const lines = content.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const numberedMatch = line.match(/^(\d+)\.\s+(.+)/)
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-2">
              <span
                className="text-xs font-bold mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(201,168,76,0.2)', color: 'var(--accent-gold)' }}
              >
                {numberedMatch[1]}
              </span>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {numberedMatch[2]}
              </p>
            </div>
          )
        }
        // Bold text **text**
        const boldParts = line.split(/(\*\*[^*]+\*\*)/)
        return (
          <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {boldParts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} style={{ color: 'var(--accent-gold)' }}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        )
      })}
    </div>
  )
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  const roleConfig = {
    judge: {
      label: '⚖️ 판사',
      bg: 'rgba(201, 168, 76, 0.08)',
      border: 'rgba(201, 168, 76, 0.25)',
      labelColor: '#c9a84c',
      avatar: '⚖️',
      avatarBg: 'rgba(201,168,76,0.15)',
    },
    prosecutor: {
      label: '🔴 검사/원고',
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.25)',
      labelColor: '#ef4444',
      avatar: '검',
      avatarBg: 'rgba(239,68,68,0.2)',
    },
    defense: {
      label: '🔵 변호사/피고',
      bg: 'rgba(59, 130, 246, 0.08)',
      border: 'rgba(59, 130, 246, 0.25)',
      labelColor: '#3b82f6',
      avatar: '변',
      avatarBg: 'rgba(59,130,246,0.2)',
    },
    user: {
      label: '👤 당신',
      bg: 'rgba(255,255,255,0.04)',
      border: 'rgba(255,255,255,0.1)',
      labelColor: 'var(--text-secondary)',
      avatar: '나',
      avatarBg: 'rgba(255,255,255,0.1)',
    },
    system: {
      label: '🔔 시스템',
      bg: 'rgba(255,255,255,0.02)',
      border: 'rgba(255,255,255,0.06)',
      labelColor: 'var(--text-muted)',
      avatar: '!',
      avatarBg: 'rgba(255,255,255,0.05)',
    },
  }

  const config = roleConfig[message.role as keyof typeof roleConfig] ?? roleConfig.user

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1"
        style={{ background: config.avatarBg, color: config.labelColor }}
      >
        {config.avatar}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <span className="text-xs px-1" style={{ color: config.labelColor }}>
          {config.label}
        </span>
        <div
          className="px-4 py-3 rounded-2xl relative"
          style={{
            background: config.bg,
            border: `1px solid ${config.border}`,
            borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
          }}
        >
          {renderContent(message.content, message.role)}
          
          {/* Streaming cursor */}
          {message.isStreaming && (
            <span
              className="inline-block w-0.5 h-4 ml-1 align-middle animate-pulse"
              style={{ background: config.labelColor }}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}
