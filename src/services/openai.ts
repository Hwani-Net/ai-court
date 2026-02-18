// AI Court - OpenAI API Service (via Cloudflare Functions in prod, direct in dev)
import type { Message, RoleType, LegalCategory, CaseType } from '@/types'
import type { VerdictAnalysis } from '@/components/VerdictCard'

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
  
  반드시 아래 형식을 엄격히 지켜 답변하세요:
  [주문] 법률 질문에 대한 결론적 답변 (1-2줄)
  [이유] 1. 관련 법조항 및 법리 해석
  2. 현재 상황에서의 법적 타당성 분석
  [권고사항] 1. 즉시 취해야 할 행동 지침
  2. 추가 증거 확보나 변호사 상담 필요성
  
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
  text: string,
  userSide: 'plaintiff' | 'defendant',
  onChunk: StreamCallback
): Promise<void> {
  const systemPrompt = `당신은 대한민국 법률 문서 분석 전문가입니다. 
  사용자가 업로드한 문서(소송장, 계약서 등)를 분석하여 ${userSide === 'plaintiff' ? '원고(고소인)' : '피고(피고소인)'} 입장에서의 유불리와 대응 전략을 제시합니다.
  
  반드시 아래 형식을 엄격히 지켜 답변하세요:
  [주문] 문서의 핵심 결론 및 승소 가능성/위험도 요약 (2-3줄)
  [이유] 1. 법적 근거 및 주요 쟁점 분석
  2. ${userSide === 'plaintiff' ? '원고' : '피고'}에게 유리한 점
  3. ${userSide === 'plaintiff' ? '원고' : '피고'}에게 불리한 점
  [권고사항] 1. 향후 구체적인 대응 전략
  2. 증거 확보 방안 등 실질적 조언
  
  ⚠️ 한국어로 전문적이고 신뢰감 있게 답변하세요.`

  await streamOpenAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `문서 내용:\n${text}` }
  ], (content, done) => {
    onChunk({ role: 'judge', content, done })
  })
}

// Core streaming function
async function streamOpenAI(
  messages: Array<{ role: string; content: string }>,
  onChunk: (content: string, done: boolean) => void
): Promise<void> {
  const isDev = import.meta.env.DEV
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  // Production: ALWAYS use Cloudflare Functions proxy (API key stays server-side)
  // Development: use direct OpenAI call with local .env key
  let endpoint: string
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (isDev && apiKey) {
    // Dev mode: direct call with local API key
    endpoint = 'https://api.openai.com/v1/chat/completions'
    headers['Authorization'] = `Bearer ${apiKey}`
  } else {
    // Production: use Cloudflare Functions proxy at /api/chat
    endpoint = '/api/chat'
  }

  let response: Response
  try {
    response = await fetch(endpoint, {
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
  } catch (err) {
    throw new Error(`네트워크 연결 실패: 인터넷 연결을 확인해주세요. (${String(err)})`)
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    if (response.status === 401) {
      throw new Error('API 인증 실패: 관리자에게 문의해주세요.')
    } else if (response.status === 429) {
      throw new Error('요청 한도 초과: 잠시 후 다시 시도해주세요.')
    } else if (response.status === 500) {
      throw new Error('서버 오류: 잠시 후 다시 시도해주세요.')
    }
    throw new Error(`API 오류 (${response.status}): ${errorText.slice(0, 100)}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('응답 본문이 비어있습니다.')

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

// Structured verdict analysis (non-streaming, JSON mode)
export async function analyzeVerdict(
  messages: Message[],
  caseType: CaseType
): Promise<VerdictAnalysis> {
  const isDev = import.meta.env.DEV
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  let endpoint: string
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (isDev && apiKey) {
    endpoint = 'https://api.openai.com/v1/chat/completions'
    headers['Authorization'] = `Bearer ${apiKey}`
  } else {
    endpoint = '/api/chat'
  }

  const trialSummary = messages
    .map(m => {
      const roleLabel = m.role === 'judge' ? '판사' : m.role === 'prosecutor' ? '검사/원고' : '변호사/피고'
      return `[${roleLabel}]: ${m.content}`
    })
    .join('\n')

  const analysisPrompt = `아래 재판 기록을 분석하여 정확히 다음 JSON 형식으로만 응답하세요. 다른 텍스트 없이 오직 JSON만 출력하세요.

{
  "ruling": "원고 승소" 또는 "피고 승소" 또는 "원고 일부 승소" 또는 "피고 일부 승소",
  "confidence": 0~100 사이의 숫자 (원고 기준 승소 가능성),
  "favorability": "plaintiff" 또는 "defendant" 또는 "neutral",
  "keyFactors": ["핵심 쟁점 1", "핵심 쟁점 2", "핵심 쟁점 3"],
  "plaintiffStrengths": ["원고에게 유리한 점 1", "원고에게 유리한 점 2"],
  "defendantStrengths": ["피고에게 유리한 점 1", "피고에게 유리한 점 2"],
  "recommendation": "당사자들에 대한 최종 권고사항을 한 문단으로"
}

사건 유형: ${caseType === 'civil' ? '민사' : '형사'}

재판 기록:
${trialSummary}`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: '당신은 법률 분석 AI입니다. 반드시 요청된 JSON 형식으로만 응답하세요.' },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 800,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '{}'
    const parsed = JSON.parse(content) as VerdictAnalysis

    // Validate and fill defaults
    return {
      ruling: parsed.ruling || '판결 불가',
      confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
      favorability: parsed.favorability || 'neutral',
      keyFactors: parsed.keyFactors || [],
      plaintiffStrengths: parsed.plaintiffStrengths || [],
      defendantStrengths: parsed.defendantStrengths || [],
      recommendation: parsed.recommendation || '전문 변호사 상담을 권장합니다.',
    }
  } catch (err) {
    console.error('Verdict analysis error:', err)
    // Return a safe fallback
    return {
      ruling: '분석 실패',
      confidence: 50,
      favorability: 'neutral',
      keyFactors: ['분석 중 오류 발생'],
      plaintiffStrengths: [],
      defendantStrengths: [],
      recommendation: '판결 분석에 실패했습니다. 위의 판결문 텍스트를 참고해주세요.',
    }
  }
}
