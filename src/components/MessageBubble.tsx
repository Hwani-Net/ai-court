import { motion } from 'framer-motion'
import type { Message } from '@/types'
import { ROLE_LABELS } from '@/types'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
  index: number
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const isJudge = message.role === 'judge'
  const isProsecutor = message.role === 'prosecutor'
  const isDefense = message.role === 'defense'
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'flex gap-3 mb-4',
        isDefense ? 'flex-row-reverse' : 'flex-row',
        isJudge && 'justify-center',
      )}
    >
      {/* Avatar */}
      {!isJudge && (
        <div
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold',
            isProsecutor && 'bg-red-900/50 text-red-300 border border-red-700/50',
            isDefense && 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
            isUser && 'bg-gray-800 text-gray-300 border border-gray-600',
          )}
        >
          {isProsecutor ? '검' : isDefense ? '변' : '나'}
        </div>
      )}

      {/* Bubble */}
      <div className={cn('max-w-[75%]', isJudge && 'max-w-[85%] w-full')}>
        {/* Role label */}
        <div className={cn(
          'text-xs mb-1 font-medium',
          isProsecutor && 'text-red-400',
          isDefense && 'text-blue-400 text-right',
          isJudge && 'text-center text-yellow-500/80',
          isUser && 'text-gray-500',
        )}>
          {ROLE_LABELS[message.role]}
        </div>

        {/* Content */}
        <div className={cn(
          'px-4 py-3 text-sm leading-relaxed',
          isProsecutor && 'bubble-prosecutor text-red-100',
          isDefense && 'bubble-defense text-blue-100',
          isJudge && 'bubble-judge text-yellow-100 text-center',
          isUser && 'bg-gray-800/60 border border-gray-700 rounded-lg text-gray-200',
        )}>
          {message.isStreaming ? (
            <span className="typing-cursor">{message.content}</span>
          ) : (
            <span style={{ whiteSpace: 'pre-wrap' }}>{message.content}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
