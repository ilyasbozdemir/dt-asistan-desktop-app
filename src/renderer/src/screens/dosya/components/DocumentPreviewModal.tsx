import React, { useState, useEffect } from 'react'
import { X, Printer, Download, RefreshCw, AlertCircle, FileText } from 'lucide-react'
import Mustache from 'mustache'

interface DocumentPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  templateHtml: string
  masterHtml: string
  baseContext: any
  onPrint: (html: string) => Promise<void>
  onExportPdf: (html: string) => Promise<void>
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  title,
  templateHtml,
  masterHtml,
  baseContext,
  onPrint,
  onExportPdf
}: DocumentPreviewModalProps): React.JSX.Element | null {
  const [overrideJson, setOverrideJson] = useState('{}')
  const [jsonError, setJsonError] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [isProcessingPrint, setIsProcessingPrint] = useState(false)
  const [isProcessingPdf, setIsProcessingPdf] = useState(false)

  // Initialization: Format context to JSON, or just leave as empty if we only want overrides
  useEffect(() => {
    if (isOpen) {
      setOverrideJson('{\n  \n}')
      setJsonError('')
      updatePreview(baseContext)
    }
  }, [isOpen, baseContext, templateHtml, masterHtml])

  const updatePreview = (contextData: any) => {
    try {
      const renderedContent = Mustache.render(templateHtml, contextData)
      const finalContext = { ...contextData, icerik: renderedContent }
      const finalHtml = Mustache.render(masterHtml, finalContext)
      setPreviewHtml(finalHtml)
    } catch (err: any) {
      console.error('Render error:', err)
    }
  }

  const handleJsonChange = (val: string) => {
    setOverrideJson(val)
    try {
      const parsedOverride = JSON.parse(val || '{}')
      setJsonError('')
      const mergedContext = { ...baseContext, ...parsedOverride }
      updatePreview(mergedContext)
    } catch (err: any) {
      setJsonError('Geçersiz JSON formatı: ' + err.message)
      // We don't update preview if JSON is invalid to avoid breaking it entirely
    }
  }

  const handlePrint = async () => {
    if (jsonError) {
      alert('Geçersiz JSON yapılandırması varken çıktı alamazsınız.')
      return
    }
    setIsProcessingPrint(true)
    try {
      await onPrint(previewHtml)
    } finally {
      setIsProcessingPrint(false)
    }
  }

  const handlePdf = async () => {
    if (jsonError) {
      alert('Geçersiz JSON yapılandırması varken PDF alamazsınız.')
      return
    }
    setIsProcessingPdf(true)
    try {
      await onExportPdf(previewHtml)
    } finally {
      setIsProcessingPdf(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-[90vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title} Önizleme</h2>
              <p className="text-xs text-slate-500">Değişkenleri JSON üzerinden ezip sonucu canlı görebilirsiniz.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR - JSON EDITOR */}
          <div className="w-1/3 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Değişken Ezme (Override)</span>
            </div>
            <div className="flex-1 p-3 relative flex flex-col">
              <textarea
                value={overrideJson}
                onChange={e => handleJsonChange(e.target.value)}
                className="flex-1 w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder='Örn: { "talepEdenPersonelAdi": "Yeni İsim" }'
                spellCheck={false}
              />
              {jsonError && (
                <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded-lg flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{jsonError}</span>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              İpucu: Buraya yazdığınız JSON verisi sadece bu yazdırma işlemi için geçerlidir. Şablon içindeki standart verileri ezer.
            </div>
          </div>

          {/* RIGHT SIDEBAR - PREVIEW */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full bg-white border-0"
              title="Print Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all text-sm"
          >
            İptal
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePdf}
              disabled={isProcessingPdf || isProcessingPrint || !!jsonError}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
            >
              {isProcessingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              PDF Olarak Kaydet
            </button>
            <button
              onClick={handlePrint}
              disabled={isProcessingPrint || isProcessingPdf || !!jsonError}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm shadow-blue-600/20"
            >
              {isProcessingPrint ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              Yazdır
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
