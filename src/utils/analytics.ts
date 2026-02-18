// GA4 Analytics utility — type-safe event tracking

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { gtag?: (...args: any[]) => void } }

/**
 * Track a GA4 custom event.
 * No-op if gtag is not loaded (e.g. local dev without GA).
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

// ── Pre-defined event helpers ──────────────────────────────────────────

/** User starts a quick legal consultation */
export const trackQuickConsultStart = (category: string) =>
  trackEvent('quick_consult_start', { category })

/** Quick consult response completed */
export const trackQuickConsultComplete = (category: string) =>
  trackEvent('quick_consult_complete', { category })

/** User starts a virtual trial simulation */
export const trackTrialStart = (caseType: string) =>
  trackEvent('trial_start', { case_type: caseType })

/** A trial round completes */
export const trackTrialRound = (round: number, role: string) =>
  trackEvent('trial_round_complete', { round, role })

/** Trial simulation finishes (all 7 rounds) */
export const trackTrialComplete = (caseType: string) =>
  trackEvent('trial_complete', { case_type: caseType })

/** User uploads a document for analysis */
export const trackDocumentUpload = (fileType: string) =>
  trackEvent('document_upload', { file_type: fileType })

/** Document analysis starts */
export const trackDocumentAnalyzeStart = () =>
  trackEvent('document_analyze_start')

/** Document analysis completes */
export const trackDocumentAnalyzeComplete = () =>
  trackEvent('document_analyze_complete')

/** User exports verdict as PDF or image */
export const trackExport = (format: 'pdf' | 'png') =>
  trackEvent('verdict_export', { format })

/** User shares content via share button */
export const trackShare = () =>
  trackEvent('share_click')

/** Theme toggle event */
export const trackThemeChange = (theme: string) =>
  trackEvent('theme_change', { theme })

/** Mode selection on landing page */
export const trackModeSelect = (mode: string) =>
  trackEvent('mode_select', { mode })
