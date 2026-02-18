import { useRef, useCallback, useState } from 'react'
import { trackExport } from '@/utils/analytics'

export function usePDFExport() {
  const verdictRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const downloadPDF = useCallback(async () => {
    if (!verdictRef.current || isExporting) return
    setIsExporting(true)

    try {
      // Dynamic import to keep initial bundle small
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const element = verdictRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0d0f14',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth - 20 // 10mm margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Header
      pdf.setFillColor(13, 15, 20)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')

      pdf.setFontSize(18)
      pdf.setTextColor(201, 168, 76)
      pdf.text('AI Court — 판결 분석 보고서', pageWidth / 2, 15, { align: 'center' })

      pdf.setFontSize(9)
      pdf.setTextColor(90, 86, 72)
      pdf.text(`생성일: ${new Date().toLocaleDateString('ko-KR')}  |  ai-court.pages.dev`, pageWidth / 2, 22, { align: 'center' })

      // Verdict card image
      const yPos = 28
      if (yPos + imgHeight <= pageHeight - 15) {
        pdf.addImage(imgData, 'PNG', 10, yPos, imgWidth, imgHeight)
      } else {
        // Scale down to fit
        const scaledHeight = pageHeight - yPos - 15
        const scaledWidth = (scaledHeight * imgWidth) / imgHeight
        pdf.addImage(imgData, 'PNG', (pageWidth - scaledWidth) / 2, yPos, scaledWidth, scaledHeight)
      }

      // Footer disclaimer
      pdf.setFontSize(7)
      pdf.setTextColor(90, 86, 72)
      pdf.text(
        '⚠️ 이 보고서는 AI 생성 결과이며 실제 법적 판결이 아닙니다. 중요한 법적 문제는 전문 변호사와 상담하세요.',
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      )

      pdf.save(`AI-Court-판결분석-${Date.now()}.pdf`)
      trackExport('pdf')
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setIsExporting(false)
    }
  }, [isExporting])

  const downloadImage = useCallback(async () => {
    if (!verdictRef.current || isExporting) return
    setIsExporting(true)

    try {
      const { default: html2canvas } = await import('html2canvas')

      const element = verdictRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0d0f14',
        logging: false,
      })

      // Add watermark
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.font = 'bold 24px sans-serif'
        ctx.fillStyle = 'rgba(201, 168, 76, 0.6)'
        ctx.textAlign = 'right'
        ctx.fillText('⚖️ AI Court', canvas.width - 20, canvas.height - 20)
      }

      const link = document.createElement('a')
      link.download = `AI-Court-판결카드-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      trackExport('png')
    } catch (err) {
      console.error('Image export error:', err)
    } finally {
      setIsExporting(false)
    }
  }, [isExporting])

  return { verdictRef, downloadPDF, downloadImage, isExporting }
}
