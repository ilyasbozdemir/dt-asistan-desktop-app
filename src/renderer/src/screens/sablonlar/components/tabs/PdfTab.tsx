import { useEffect, useState } from 'react'
import { FileText, RefreshCw, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '../../../../components/ui/Button'

interface PdfTabProps {
  isPdfLoading: boolean
  pdfBase64: string
  handleUpdatePdfPreview: () => void
}

export function PdfTab({ isPdfLoading, pdfBase64, handleUpdatePdfPreview }: PdfTabProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  useEffect(() => {
    let url = ''
    if (pdfBase64) {
      try {
        const byteCharacters = atob(pdfBase64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })
        url = URL.createObjectURL(blob)
        setPdfUrl(url)
      } catch (e) {
        console.error('PDF Blob error', e)
      }
    } else {
      setPdfUrl('')
    }

    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [pdfBase64])

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const renderPdfContent = () => {
    return (
      <>
        {isPdfLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                PDF Hazırlanıyor...
              </div>
            </div>
          </div>
        ) : null}
        {pdfUrl ? (
          <iframe title="pdf-preview" src={pdfUrl} className="w-full h-full border-0 bg-white" />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 h-full">
            <FileText className="w-12 h-12 text-slate-300 mb-3" />
            <p>PDF oluşturmak için Yenile butonuna basın.</p>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Gerçek PDF Çıktısı Önizleme
              </h2>
              <p className="text-xs text-slate-500">
                Sayfalanmış, antetli ve altbilgili son halini görüntülüyorsunuz.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pdfUrl && (
              <Button
                onClick={() => setIsFullscreen(true)}
                variant="outline"
                className="text-slate-600 dark:text-slate-300 text-xs py-1.5 px-3 shadow-sm flex items-center gap-2"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Tam Ekran
              </Button>
            )}
            <Button
              onClick={handleUpdatePdfPreview}
              disabled={isPdfLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-4 shadow-sm flex items-center gap-2 border-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPdfLoading ? 'animate-spin' : ''}`} />
              {isPdfLoading ? 'Oluşturuluyor...' : "PDF'i Yenile"}
            </Button>
          </div>
        </div>
        <div className="flex-1 relative bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden flex justify-center border border-slate-300 dark:border-slate-700">
          {renderPdfContent()}
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          <div className="flex justify-between items-center p-4 bg-slate-900 shadow-md">
            <div className="flex items-center gap-3 text-white">
              <FileText className="w-6 h-6 text-blue-400" />
              <div>
                <h2 className="font-bold text-lg">Gerçek PDF Çıktısı</h2>
                <p className="text-xs text-slate-400">Önizleme Modu (Çıkmak için ESC'ye basın)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleUpdatePdfPreview}
                disabled={isPdfLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 shadow-sm flex items-center gap-2 border-0"
              >
                <RefreshCw className={`w-4 h-4 ${isPdfLoading ? 'animate-spin' : ''}`} />
                Yenile
              </Button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 flex items-center justify-center transition-colors outline-none"
                title="Kapat (ESC)"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 flex justify-center">
            <div className="w-full h-full relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              {renderPdfContent()}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
