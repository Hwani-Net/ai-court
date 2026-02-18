// AI Court - Type Definitions

export type CourtMode = 'quick' | 'trial' | 'document'

export type RoleType = 'judge' | 'prosecutor' | 'defense' | 'user' | 'system'

export interface Message {
  id: string
  role: RoleType
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export interface TrialCase {
  id: string
  mode: CourtMode
  title: string
  description: string
  messages: Message[]
  verdict?: Verdict
  createdAt: Date
}

export interface Verdict {
  ruling: string        // 주문 (판결 결과)
  reasoning: string     // 이유
  recommendation: string // 권고사항
  favorability: 'plaintiff' | 'defendant' | 'neutral'
}

export interface QuickConsultInput {
  question: string
  category: LegalCategory
}

export interface TrialInput {
  plaintiffSide: string   // 원고/고소인 주장
  defendantSide: string   // 피고/피고소인 주장
  caseType: CaseType
  additionalFacts?: string
}

export interface DocumentInput {
  documentText: string
  userSide: 'plaintiff' | 'defendant'
  additionalContext?: string
}

export type LegalCategory = 
  | 'contract'      // 계약
  | 'property'      // 부동산/재산
  | 'labor'         // 노동
  | 'family'        // 가족/이혼
  | 'criminal'      // 형사
  | 'consumer'      // 소비자
  | 'traffic'       // 교통사고
  | 'other'         // 기타

export type CaseType = 'civil' | 'criminal'

export const LEGAL_CATEGORIES: Record<LegalCategory, string> = {
  contract: '계약 분쟁',
  property: '부동산/재산',
  labor: '노동/임금',
  family: '가족/이혼',
  criminal: '형사 사건',
  consumer: '소비자 피해',
  traffic: '교통사고',
  other: '기타',
}

export const ROLE_LABELS: Record<RoleType, string> = {
  judge: '⚖️ 판사',
  prosecutor: '🔴 검사/원고',
  defense: '🔵 변호사/피고',
  user: '👤 당신',
  system: '📋 시스템',
}

export const ROLE_COLORS: Record<RoleType, string> = {
  judge: 'var(--judge)',
  prosecutor: 'var(--prosecutor)',
  defense: 'var(--defense)',
  user: '#888',
  system: '#666',
}
