import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, X, Loader2, Scale } from 'lucide-react'
import { MessageBubble } from '@/components/MessageBubble'
import { ShareButton } from '@/components/ShareButton'
import { analyzeDocument } from '@/services/openai'
import type { Message } from '@/types'

export function DocumentPage() {
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [userSide, setUserSide] = useState<'plaintiff' | 'defendant'>('plaintiff')
  const [messages, setMessages] = useState<Message[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (uploadedFile: File) => {
    setFile(uploadedFile)
    setIsExtracting(true)

    try {
      if (uploadedFile.type === 'application/pdf') {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
        
        const arrayBuffer = await uploadedFile.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        
        let fullText = ''
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((item: any) => item.str || '')
            .join(' ')
          fullText += pageText + '\n'
        }
        setExtractedText(fullText.trim())
      } else if (uploadedFile.type === 'text/plain') {
        const text = await uploadedFile.text()
        setExtractedText(text)
      }
    } catch (err) {
      console.error('File extraction error:', err)
      setExtractedText('파일 읽기에 실패했습니다. 텍스트를 직접 입력해주세요.')
    } finally {
      setIsExtracting(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileUpload(droppedFile)
  }, [handleFileUpload])

  const handleAnalyze = useCallback(async () => {
    if (!extractedText.trim() || isAnalyzing) return
    setIsAnalyzing(true)
    setMessages([])

    const streamingId = Date.now().toString()
    const streamingMsg: Message = {
      id: streamingId,
      role: 'judge',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }
    setMessages([streamingMsg])

    try {
      await analyzeDocument(extractedText, userSide, ({ content, done }) => {
        if (done) {
          setMessages(prev =>
            prev.map(m => m.id === streamingId ? { ...m, isStreaming: false } : m)
          )
          setIsAnalyzing(false)
        } else {
          setMessages(prev =>
            prev.map(m => m.id === streamingId ? { ...m, content: m.content + content } : m)
          )
        }
      })
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === streamingId
          ? { ...m, content: '⚠️ 분석 중 오류가 발생했습니다.', isStreaming: false }
          : m
        )
      )
      setIsAnalyzing(false)
    }
  }, [extractedText, userSide, isAnalyzing])

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="p-4 sm:p-8 w-full" style={{ maxWidth: '56rem', margin: '0 auto' }}>
        {/* Animated Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5 mb-10 text-center"
        >
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl"
               style={{ background: 'linear-gradient(135deg, rgba(224,82,82,0.2), rgba(224,82,82,0.05))', border: '1px solid rgba(224,82,82,0.3)' }}>
            <FileText size={36} className="text-[var(--prosecutor)] relative z-10" />
            <div className="absolute inset-0 bg-[var(--prosecutor)] opacity-10 blur-xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              <span className="gradient-text-gold">소송장 분석</span>
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              AI가 문서를 정밀 분석하여 <span className="text-[var(--accent-gold)] font-medium">유불리 조항</span>을 찾아냅니다
            </p>
          </div>
        </motion.div>

        {!messages.length ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* File Upload Zone */}
            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 overflow-hidden"
                style={{ 
                  borderColor: 'var(--border-strong)', 
                  background: 'var(--bg-card)',
                }}
              >
                <div className="absolute inset-0 bg-[var(--accent-gold)] opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                <div className="flex justify-center mb-4">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border)] shadow-lg"
                  >
                    <Upload size={28} style={{ color: 'var(--accent-gold)' }} />
                  </motion.div>
                </div>
                <p className="text-lg font-medium mb-2 text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
                  PDF 또는 텍스트 파일 업로드
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  소송장, 계약서, 내용증명 등을 드래그하세요
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </div>
            ) : (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-4 p-5 rounded-xl border relative overflow-hidden group"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--accent-gold)' }}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <FileText size={24} className="text-[var(--accent-gold)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {isExtracting ? (
                      <span className="text-xs text-[var(--accent-gold)] flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" /> 텍스트 추출 중...
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                        {extractedText.length.toLocaleString()}자 추출 완료
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => { setFile(null); setExtractedText(''); setMessages([]) }}
                  className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors text-[var(--text-muted)] hover:text-red-400"
                >
                  <X size={18} />
                </button>
              </motion.div>
            )}

            {/* Manual Text Input */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--border)] to-[var(--border-strong)] rounded-xl opacity-50 group-hover:opacity-100 transition duration-500 blur-sm pointer-events-none" />
              <textarea
                value={extractedText}
                onChange={e => setExtractedText(e.target.value)}
                placeholder="또는 여기에 법률 문서 내용을 직접 붙여넣으세요..."
                className="relative w-full px-5 py-4 rounded-xl text-sm resize-none outline-none transition-all focus:ring-1 focus:ring-[var(--accent-gold)]"
                rows={8}
                style={{
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Side Selection Cards */}
            <div className="grid grid-cols-2 gap-4">
              {(['plaintiff', 'defendant'] as const).map(side => {
                const isActive = userSide === side
                const activeColor = side === 'plaintiff' ? 'var(--prosecutor)' : 'var(--defense)'
                
                return (
                  <button
                    key={side}
                    onClick={() => setUserSide(side)}
                    className="relative p-4 rounded-xl border text-left transition-all duration-300 overflow-hidden group"
                    style={{
                      borderColor: isActive ? activeColor : 'var(--border)',
                      background: isActive ? (side === 'plaintiff' ? 'var(--prosecutor-bg)' : 'var(--defense-bg)') : 'var(--bg-card)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">{side === 'plaintiff' ? '🔴' : '🔵'}</span>
                      {isActive && (
                        <motion.div layoutId="check" className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10" style={{ color: activeColor }}>
                          선택됨
                        </motion.div>
                      )}
                    </div>
                    <div className="font-bold text-sm mb-0.5" style={{ color: isActive ? activeColor : 'var(--text-primary)' }}>
                      {side === 'plaintiff' ? '원고 (Plaintiff)' : '피고 (Defendant)'}
                    </div>
                    <div className="text-xs opacity-70" style={{ color: 'var(--text-secondary)' }}>
                      {side === 'plaintiff' ? '소송을 제기하는 입장' : '소송을 당한 입장'}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(201,168,76,0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={!extractedText.trim() || isAnalyzing}
              className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-dark) 100%)', 
                color: '#1a1208',
                border: '1px solid var(--accent-gold-light)'
              }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>AI가 법률 문서를 분석 중입니다...</span>
                </>
              ) : (
                <>
                  <Scale size={20} />
                  <span>분석 시작하기</span>
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          /* Analysis Result */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-10"
          >
            <div className="gold-divider my-6" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[var(--accent-gold)] rounded-full" />
                <h3 className="text-lg font-bold gradient-text-gold">
                  AI 법률 분석 리포트
                </h3>
              </div>
              {!isAnalyzing && (
                <ShareButton text="AI Court에서 소송장 분석 리포트를 확인해보세요!" />
              )}
            </div>
            
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <MessageBubble key={msg.id} message={msg} index={i} />
              ))}
            </div>

            {!isAnalyzing && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => { setFile(null); setExtractedText(''); setMessages([]) }}
                className="mx-auto mt-12 px-6 py-2 rounded-full text-sm font-medium border flex items-center gap-2 hover:bg-[var(--bg-card)] transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <X size={14} /> 다른 문서 분석하기
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
