// AI Court - OpenAI API Service (via Cloudflare Functions in prod, direct in dev)
import type { Message, RoleType, LegalCategory, CaseType } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE || ''

// System prompts for each role
const JUDGE_PROMPT = `당신은 대한민국 법원의 공정하고 권위 있는 판사입니다.
역할:
- 재판을 진행하고 양측 주장을 공정하게 듣습니다
- 법률적 근거에 따라 판단합니다
- 명확하고 권위 있는 어조로 발언합니다
- 한국 민법, 형법, 민사소송법을 기준으로 합니다
- 발언은 간결하게 2-4문장으로 합니다
- 반드시 한국어로 답변합니다
주의: 이 서비스는 법률 정보 제공 목적이며 실제 법률 자문이 아닙니다.`

const PROSECUTOR_PROMPT = `당신은 대한민국의 유능한 검사/원고 측 변호사입니다.
역할:
- 원고(고소인) 측의 입장을 강력하게 변호합니다
- 법적 근거와 증거를 들어 주장합니다
- 상대방 주장의 허점을 날카롭게 지적합니다
- 공격적이지만 법적으로 타당한 논리를 펼칩니다
- 발언은 2-4문장으로 간결하게 합니다
- 반드시 한국어로 답변합니다`

const DEFENSE_PROMPT = `당신은 대한민국의 유능한 피고 측 변호사입니다.
역할:
- 피고(피고소인) 측의 입장을 강력하게 변호합니다
- 법적 근거와 반증을 들어 방어합니다
- 검사/원고 측 주장의 논리적 허점을 반박합니다
- 의뢰인에게 유리한 법적 해석을 제시합니다
- 발언은 2-4문장으로 간결하게 합니다
- 반드시 한국어로 답변합니다`

export interface StreamChunk {
  role: RoleType
  content: string
  done: boolean
}

type StreamCallback = (chunk: StreamChunk) => void

// Quick consultation - single GPT call
export async function quickConsult(
  question: string,
  category: LegalCategory,
  onChunk: StreamCallback
): Promise<void> {
  const systemPrompt = `당신은 대한민국 법률 전문가입니다. 
사용자의 법률 질문에 대해 핵심만 간결하게 답변합니다.
카테고리: ${category}
답변 형식:
1. 핵심 법률 요점 (2-3줄)
2. 관련 법조항 (있다면)
3. 권고 행동 (1-2줄)
⚠️ 이 답변은 법률 정보 제공 목적이며 실제 법률 자문이 아닙니다.
반드시 한국어로 답변하세요.`

  await streamOpenAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question }
  ], (content, done) => {
    onChunk({ role: 'judge', content, done })
  })
}

// Trial simulation - sequential multi-role calls
export async function runTrialRound(
  caseDescription: string,
  caseType: CaseType,
  round: number,
  previousMessages: Message[],
  onChunk: StreamCallback
): Promise<void> {
  const context = previousMessages
    .map(m => {
      const roleLabel = m.role === 'judge' ? '판사' : m.role === 'prosecutor' ? '검사/원고' : '변호사/피고'
      return `[${roleLabel}]: ${m.content}`
    })
    .join('\n')

  const caseContext = `사건 유형: ${caseType === 'civil' ? '민사' : '형사'}
사건 내용: ${caseDescription}
현재 라운드: ${round}
이전 발언:
${context}`

  // Round structure:
  // 1: Judge opens court
  // 2: Prosecutor opening statement
  // 3: Defense opening statement
  // 4: Judge mid-trial questions
  // 5: Prosecutor rebuttal
  // 6: Defense rebuttal
  // 7: Judge final verdict
  if (round === 1) {
    await streamOpenAI([
      { role: 'system', content: JUDGE_PROMPT },
      { role: 'user', content: `다음 사건의 재판을 시작합니다. 개정을 선언하고 양측에 주장 기회를 주세요.\n${caseContext}` }
    ], (content, done) => onChunk({ role: 'judge', content, done }))
  } else if (round === 2 || round === 5) {
    await streamOpenAI([
      { role: 'system', content: PROSECUTOR_PROMPT },
      { role: 'user', content: `다음 사건에서 원고/검사 측 주장을 펼치세요. 구체적인 법적 근거를 들어 주장하세요.\n${caseContext}` }
    ], (content, done) => onChunk({ role: 'prosecutor', content, done }))
  } else if (round === 3 || round === 6) {
    await streamOpenAI([
      { role: 'system', content: DEFENSE_PROMPT },
      { role: 'user', content: `다음 사건에서 피고/변호인 측 반박을 펼치세요. 검사 주장의 허점을 지적하고 방어하세요.\n${caseContext}` }
    ], (content, done) => onChunk({ role: 'defense', content, done }))
  } else if (round === 4) {
    await streamOpenAI([
      { role: 'system', content: JUDGE_PROMPT },
      { role: 'user', content: `양측 주장을 들었습니다. 핵심 쟁점을 정리하고 추가 확인이 필요한 사항을 질문하세요.\n${caseContext}` }
    ], (content, done) => onChunk({ role: 'judge', content, done }))
  } else {
    // Round 7: Final verdict
    await streamOpenAI([
      { role: 'system', content: JUDGE_PROMPT },
      { role: 'user', content: `모든 주장을 들었습니다. 최종 판결을 내려주세요.\n형식: [주문] 판결 내용 / [이유] 법적 근거 / [권고사항] 향후 조치\n${caseContext}` }
    ], (content, done) => onChunk({ role: 'judge', content, done }))
  }
}

// Document analysis
export async function analyzeDocument(
  documentText: string,
  userSide: 'plaintiff' | 'defendant',
  onChunk: StreamCallback
): Promise<void> {
  const sideLabel = userSide === 'plaintiff' ? '원고(고소인)' : '피고(피고소인)'
  
  const systemPrompt = `당신은 대한민국의 법률 전문가 팀입니다. 
제출된 법률 문서를 분석하여 ${sideLabel} 입장에서 재판 시나리오를 시뮬레이션합니다.
분석 형식:
📋 문서 요약
⚔️ 핵심 쟁점
🔴 불리한 점
🔵 유리한 점  
⚖️ 예상 판결 방향
💡 권고 전략
반드시 한국어로 답변하세요.`

  await streamOpenAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `다음 법률 문서를 분석해주세요:\n\n${documentText}` }
  ], (content, done) => {
    onChunk({ role: 'judge', content, done })
  })
}

// Core streaming function
async function streamOpenAI(
  messages: Array<{ role: string; content: string }>,
  onChunk: (content: string, done: boolean) => void
): Promise<void> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  // In production, use Cloudflare Function; in dev, call directly
  const endpoint = API_BASE 
    ? `${API_BASE}/api/chat` 
    : 'https://api.openai.com/v1/chat/completions'

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (!API_BASE && apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      stream: true,
      max_tokens: 600,
      temperature: 0.8,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API Error: ${response.status} - ${error}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim()
        if (data === '[DONE]') {
          onChunk('', true)
          return
        }
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content || ''
          if (content) onChunk(content, false)
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }
  onChunk('', true)
}
