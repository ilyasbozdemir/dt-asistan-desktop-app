import React, { useState, useEffect } from 'react'
import { Sparkles, X, Loader2, Check, RefreshCw } from 'lucide-react'
import { cn } from '../../utils/cn'

interface AITextGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  fieldName: string
  initialSubject?: string
  initialPrompt?: string
  systemInstruction?: string
  onApply: (generatedText: string) => void
}

export function AITextGeneratorModal({
  isOpen,
  onClose,
  title,
  fieldName,
  initialSubject = '',
  initialPrompt = '',
  systemInstruction = '',
  onApply
}: AITextGeneratorModalProps) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  // Set default prompt when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialPrompt) {
        setPrompt(initialPrompt)
      } else if (initialSubject) {
        setPrompt(`"${initialSubject}" konusu için detaylı, resmi ve profesyonel bir kamu ihalesi ${fieldName.toLowerCase()} metni oluştur.`)
      } else {
        setPrompt('')
      }
      setResult('')
      setError('')
    }
  }, [isOpen, initialSubject, initialPrompt, fieldName])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Lütfen yapay zekaya ne yapacağını söyleyen bir talimat girin.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const finalPrompt = systemInstruction 
        ? `${systemInstruction}\n\nKullanıcı İsteği:\n${prompt}`
        : prompt

      const res = await window.api.aiGenerate({ prompt: finalPrompt })
      if (res.success && res.data) {
        setResult(res.data.trim())
      } else {
        setError(res.error || 'Yapay zeka yanıt üretemedi. Ayarlar > Yapay Zeka sayfasından API anahtarınızı kontrol edin.')
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    onApply(result)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className={cn(
        'relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden',
        'animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/20">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-850 dark:text-slate-100">{title}</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Yapay zeka ile metin oluşturun ve düzenleyin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar">
          {/* Instructions Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-650 dark:text-slate-400">
              Yapay Zekaya Talimatınız
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Yapay zekanın nasıl bir metin üretmesini istediğinizi yazın (örn: Belediye binası temizlik işi ihalesi için idari şartnameye uygun iş tanımı oluştur. Süre 6 ay olsun, malzemeleri yüklenici karşılasın.)"
              className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-800 dark:text-slate-250 font-semibold"
            />
          </div>

          {/* Quick templates */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 flex items-center mr-1">Örnekler:</span>
            <button
              type="button"
              onClick={() => setPrompt(`"${initialSubject || 'Mal Alımı'}" ihalesi için resmi teknik/idari açıklama hazırlığı yap.`)}
              className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg transition-colors font-medium border-none"
            >
              Resmi Açıklama
            </button>
            <button
              type="button"
              onClick={() => setPrompt(`"${initialSubject || 'Hizmet Alımı'}" işinin kapsamını maddeler halinde listele.`)}
              className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg transition-colors font-medium border-none"
            >
              Kapsam Maddeleri
            </button>
            <button
              type="button"
              onClick={() => setPrompt(`"${initialSubject || 'Yapım İşi'}" için ihale teknik şartnamesine uygun özet metin oluştur.`)}
              className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg transition-colors font-medium border-none"
            >
              Şartname Özeti
            </button>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-500/20 disabled:opacity-55"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Metin Oluşturuluyor...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Metni Üret
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs">
              ⚠️ {error}
            </div>
          )}

          {/* AI Result Area */}
          {(result || loading) && (
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Üretilen Metin (Düzenleyebilirsiniz)
                </label>
                {result && (
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 font-semibold border-none bg-transparent"
                  >
                    <RefreshCw size={10} /> Yenile
                  </button>
                )}
              </div>

              {loading ? (
                <div className="w-full h-40 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                  <span className="text-xs text-slate-450 italic">AI metin yazıyor...</span>
                </div>
              ) : (
                <textarea
                  rows={6}
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-white leading-normal font-semibold resize-y"
                />
              )}

              {result && !loading && (
                <button
                  type="button"
                  onClick={handleApply}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                >
                  <Check size={14} />
                  Forma Uygula ve Kapat
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
