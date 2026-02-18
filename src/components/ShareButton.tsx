import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Copy, Check, MessageCircle } from 'lucide-react'
import { trackShare } from '@/utils/analytics'

interface ShareButtonProps {
  title?: string
  text?: string
  url?: string
}

export function ShareButton({ 
  title = 'AI Court — AI 가상 법정 시뮬레이션',
  text = 'AI 판사·검사·변호사가 실제 법정처럼 내 사건을 심리해줬어요! 무료로 체험해보세요.',
  url = 'https://ai-court.pages.dev'
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const copyLink = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareKakao = () => {
    // Share via Web Share API (mobile) or Kakao Story (desktop)
    if (navigator.share) {
      navigator.share({ title, text, url })
    } else {
      window.open(`https://story.kakao.com/share?url=${encodeURIComponent(url)}`, '_blank')
    }
  }

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(v => !v); if (!open) trackShare() }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:bg-white/10"
        style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
      >
        <Share2 size={13} />
        공유
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-8 z-20 rounded-xl p-2 min-w-[160px] shadow-2xl"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={copyLink}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                {copied ? <Check size={13} style={{ color: '#4ade80' }} /> : <Copy size={13} />}
                {copied ? '복사됨!' : '링크 복사'}
              </button>
              <button
                onClick={shareKakao}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                <MessageCircle size={13} style={{ color: '#FAE100' }} />
                카카오 공유
              </button>
              <button
                onClick={shareTwitter}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1DA1F2' }}>𝕏</span>
                트위터 공유
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
