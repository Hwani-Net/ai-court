// Daily usage limiter using localStorage
// Free tier: 3 quick consults/day, 1 trial/day, 2 doc analyses/day

const STORAGE_KEY = 'ai-court-usage'

interface DailyUsage {
  date: string       // YYYY-MM-DD
  quickConsult: number
  trial: number
  document: number
}

export const LIMITS = {
  quickConsult: 3,
  trial: 1,
  document: 2,
} as const

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function getUsage(): DailyUsage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { date: getTodayKey(), quickConsult: 0, trial: 0, document: 0 }

    const parsed: DailyUsage = JSON.parse(raw)

    // Reset if it's a new day
    if (parsed.date !== getTodayKey()) {
      return { date: getTodayKey(), quickConsult: 0, trial: 0, document: 0 }
    }
    return parsed
  } catch {
    return { date: getTodayKey(), quickConsult: 0, trial: 0, document: 0 }
  }
}

function saveUsage(usage: DailyUsage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage))
}

export type FeatureKey = 'quickConsult' | 'trial' | 'document'

/** Check if a feature is within daily limit */
export function canUseFeature(feature: FeatureKey): boolean {
  const usage = getUsage()
  return usage[feature] < LIMITS[feature]
}

/** Get remaining uses for a feature */
export function getRemainingUses(feature: FeatureKey): number {
  const usage = getUsage()
  return Math.max(0, LIMITS[feature] - usage[feature])
}

/** Get total uses today for a feature */
export function getUsedCount(feature: FeatureKey): number {
  return getUsage()[feature]
}

/** Increment usage count for a feature. Returns false if limit exceeded. */
export function consumeUsage(feature: FeatureKey): boolean {
  const usage = getUsage()
  if (usage[feature] >= LIMITS[feature]) return false
  usage[feature]++
  saveUsage(usage)
  return true
}

/** Get feature display info */
export function getFeatureInfo(feature: FeatureKey) {
  const map = {
    quickConsult: { label: '빠른 법률 상담', emoji: '⚡', limit: LIMITS.quickConsult },
    trial:        { label: '가상 재판 시뮬레이션', emoji: '⚔️', limit: LIMITS.trial },
    document:     { label: '소송장 분석', emoji: '📄', limit: LIMITS.document },
  }
  return map[feature]
}
