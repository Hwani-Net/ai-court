import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { MessageBubble } from '@/components/MessageBubble'
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
        // Dynamic import of pdfjs-dist
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
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--accent-gold)', fontFamily: 'Playfair Display, serif' }}>
            📄 소송장 분석
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            법률 문서를 업로드하면 AI가 내 입장에서 유불리를 분석합니다
          </p>
        </div>

        {/* File upload zone */}
        {!file ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-6"
            style={{ borderColor: 'var(--border-strong)', background: 'var(--bg-card)' }}
            whileHover={{ borderColor: 'var(--accent-gold)', background: 'rgba(201,168,76,0.05)' }}
          >
            <Upload size={32} className="mx-auto mb-3" style={{ color: 'var(--accent-gold)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              PDF 또는 텍스트 파일을 드래그하거나 클릭하세요
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              소송장, 계약서, 내용증명, 판결문 등 지원
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </motion.div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <FileText size={20} style={{ color: 'var(--accent-gold)' }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
              {isExtracting && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>텍스트 추출 중...</p>}
              {!isExtracting && extractedText && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {extractedText.length.toLocaleString()}자 추출됨
                </p>
              )}
            </div>
            <button onClick={() => { setFile(null); setExtractedText(''); setMessages([]) }}>
              <X size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        )}

        {/* Manual text input */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
            또는 직접 텍스트 입력
          </label>
          <textarea
            value={extractedText}
            onChange={e => setExtractedText(e.target.value)}
            placeholder="소송장, 계약서 내용을 직접 붙여넣으세요..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* User side selector */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
            나의 입장
          </label>
          <div className="flex gap-3">
            {(['plaintiff', 'defendant'] as const).map(side => (
              <button
                key={side}
                onClick={() => setUserSide(side)}
                className="flex-1 py-3 rounded-xl border text-sm font-medium transition-all"
                style={{
                  borderColor: userSide === side
                    ? (side === 'plaintiff' ? 'var(--prosecutor)' : 'var(--defense)')
                    : 'var(--border)',
                  background: userSide === side
                    ? (side === 'plaintiff' ? 'var(--prosecutor-bg)' : 'var(--defense-bg)')
                    : 'var(--bg-card)',
                  color: userSide === side
                    ? (side === 'plaintiff' ? 'var(--prosecutor)' : 'var(--defense)')
                    : 'var(--text-secondary)',
                }}
              >
                {side === 'plaintiff' ? '🔴 원고 (고소인)' : '🔵 피고 (피고소인)'}
              </button>
            ))}
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={!extractedText.trim() || isAnalyzing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 mb-6"
          style={{ background: 'var(--accent-gold)', color: '#1a1208' }}
        >
          {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : '⚖️'}
          {isAnalyzing ? '분석 중...' : '법률 분석 시작'}
        </button>

        {/* Results */}
        {messages.length > 0 && (
          <div>
            <div className="gold-divider mb-4" />
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--accent-gold)' }}>
              📋 분석 결과
            </h3>
            {messages.map((msg, i) => (
              <MessageBubble key={msg.id} message={msg} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
