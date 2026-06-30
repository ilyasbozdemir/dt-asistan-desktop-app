import React, { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Download,
  FileText,
  Printer,
  RefreshCw,
  X,
  Bot,
  Loader2
} from 'lucide-react'
import Mustache from 'mustache'
import Editor from '@monaco-editor/react'

interface DocumentPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  templateHtml: string
  masterHtml: string
  baseContext: any
  placeholders?: any[]
  personelListesi?: any[]
  onPrint: (html: string) => Promise<void>
  onExportPdf: (html: string) => Promise<void>
  isInline?: boolean
  templateTestVerisi?: string
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  title,
  templateHtml,
  masterHtml,
  baseContext,
  placeholders = [],
  personelListesi = [],
  onPrint,
  onExportPdf,
  isInline = false,
  templateTestVerisi = ''
}: DocumentPreviewModalProps): React.JSX.Element | null {
  const [overrideData, setOverrideData] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form')
  const [overrideJson, setOverrideJson] = useState('{\n  \n}')
  const [jsonError, setJsonError] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [isProcessingPrint, setIsProcessingPrint] = useState(false)
  const [isProcessingPdf, setIsProcessingPdf] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [isAiGenerating, setIsAiGenerating] = useState(false)

  const handleAiEdit = async () => {
    if (!aiPrompt.trim()) return
    setIsAiGenerating(true)
    try {
      const res = await window.electron.ipcRenderer.invoke('ai:generate', {
        prompt: `Mevcut JSON Yapısı:\n${overrideJson}\n\nKullanıcı Talimatı: ${aiPrompt}\n\nLütfen talimata göre JSON verisini güncelle. Sadece geçerli JSON çıktısı döndür. Markdown kod blokları (\`\`\`json) veya açıklama ekleme.`,
        systemInstruction:
          'Sen JSON verilerini talimata göre güncelleyen bir yardımcı asistansın. Çıktın her zaman sadece geçerli bir JSON olmalıdır, hiçbir açıklama veya markdown bloğu içermemelidir.'
      })
      if (res && res.success) {
        let cleanText = res.data.trim()
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```[a-zA-Z0-9]*\\n/, '').replace(/\\n```$/, '')
        }
        const parsed = JSON.parse(cleanText)
        setOverrideData(parsed)
        setOverrideJson(JSON.stringify(parsed, null, 2))
        const mergedContextData = { ...baseContext, ...parsed }
        updatePreview(mergedContextData)
        setAiPrompt('')
      } else {
        alert('AI işlemi başarısız oldu: ' + (res?.error || 'Bilinmeyen hata'))
      }
    } catch (err: any) {
      alert('Hata: ' + err.message)
    } finally {
      setIsAiGenerating(false)
    }
  }

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

  const mergedContext = React.useMemo(() => {
    let testData = {}
    if (templateTestVerisi) {
      try {
        testData = JSON.parse(templateTestVerisi)
      } catch (e) {
        console.error('Failed to parse template test verisi:', e)
      }
    }
    // Eğer gerçek dosya verisi varsa, dummy test verilerini karıştırmayalım ki kullanıcının yaptığı mapping net görünsün.
    const hasRealData = baseContext && Object.keys(baseContext).length > 2 // logo vb. harici dosya verisi varsa
    if (hasRealData) {
      return { ...baseContext }
    }
    return { ...testData, ...baseContext }
  }, [baseContext, templateTestVerisi])

  // Initialization: Format context to JSON on open
  useEffect(() => {
    if (isOpen) {
      setOverrideData({})
      // JSON tab'ı tam context ile başlat (tüm anahtarları göster)
      setOverrideJson(JSON.stringify(mergedContext, null, 2))
      setJsonError('')
      updatePreview(mergedContext)
    }
  }, [isOpen, mergedContext, templateHtml, masterHtml])

  const handleFormChange = (key: string, value: any) => {
    const newData = { ...overrideData, [key]: value }
    setOverrideData(newData)
    setOverrideJson(JSON.stringify(newData, null, 2))

    const mergedContext = { ...baseContext, ...newData }
    updatePreview(mergedContext)
  }

  const handleJsonChange = (val: string) => {
    setOverrideJson(val)
    try {
      const parsedOverride = JSON.parse(val || '{}')
      setJsonError('')
      setOverrideData(parsedOverride)
      const mergedContext = { ...baseContext, ...parsedOverride }
      updatePreview(mergedContext)
    } catch (err: any) {
      setJsonError('Geçersiz JSON formatı: ' + err.message)
    }
  }

  const handlePrint = async () => {
    if (jsonError && activeTab === 'json') {
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
    if (jsonError && activeTab === 'json') {
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

  // Şablon ve Master HTML içerisinde gerçekten kullanılan değişkenleri tespit et
  const extractUsedVars = (html: string) => {
    const matches = Array.from(html.matchAll(/\{\{([#^\/]?)([a-zA-Z0-9_]+)\}\}/g))
    return matches.map((m) => m[2])
  }

  const usedVars = new Set([
    ...extractUsedVars(templateHtml || ''),
    ...extractUsedVars(masterHtml || '')
  ])

  // Orijinal bağlamdaki (mergedContext) verilerden SADECE şablonda kullanılan form alanlarını üret
  // Personel alanları haritası (context key -> { adiKey, unvanKey, etiket })
  const PERSONNEL_FIELDS: Record<string, { adiKey: string; unvanKey: string; etiket: string }> = {
    hazirlayanPersonelAdi: {
      adiKey: 'hazirlayanPersonelAdi',
      unvanKey: 'hazirlayanPersonelUnvan',
      etiket: 'Hazırlayan Personel'
    },
    talepEdenPersonelAdi: {
      adiKey: 'talepEdenPersonelAdi',
      unvanKey: 'talepEdenPersonelUnvan',
      etiket: 'Talep Eden Personel'
    },
    sunanPersonelAdi: {
      adiKey: 'sunanPersonelAdi',
      unvanKey: 'sunanPersonelUnvan',
      etiket: 'Sunan Personel'
    },
    onaylayanPersonelAdi: {
      adiKey: 'onaylayanPersonelAdi',
      unvanKey: 'onaylayanPersonelUnvan',
      etiket: 'Onaylayan (Harcama Yetkilisi)'
    },
    ilgiliPersonelAdi: {
      adiKey: 'ilgiliPersonelAdi',
      unvanKey: 'ilgiliPersonelUnvan',
      etiket: 'İrtibat Yetkilisi'
    }
  }

  const personnelContextKeys = Object.keys(PERSONNEL_FIELDS)

  const allowedFormKeys = [
    'sunulacakMakamAdi',
    'evrakSayisi',
    'tarih',
    'dosyaTarihi',
    'dosyaKonusu',
    'ihtiyacYeri',
    'kurumIci',
    'olurYazisi',
    // Personel alanları
    ...personnelContextKeys
  ]
  const formFields = Object.keys(mergedContext || {}).filter(
    (k) => k !== 'icerik' && usedVars.has(k) && allowedFormKeys.includes(k)
  )

  // Personel alanları için: şablonda kullanılan personel key'lerini tespit et
  // (usedVars'ta olmasa bile, şablonda kullanılıyor olabilir — örn. hazirlayanPersonelAdi veya hazırlayanPersonelAdi)
  const activePersonnelFields = personnelContextKeys.filter(
    (k) => usedVars.has(k) || usedVars.has(PERSONNEL_FIELDS[k].unvanKey)
  )

  if (isInline) {
    return (
      <div className="bg-white dark:bg-slate-900 w-full h-[calc(100vh-235px)] rounded-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-400 mr-1"
              title="Geri Dön"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {title} Önizleme
              </h2>
              <p className="text-xs text-slate-500">
                Form veya JSON üzerinden değişkenleri ezerek sonucu canlı görebilirsiniz.
              </p>
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto custom-scrollbar">
                {Array.from(usedVars)
                  .filter((k) => k !== 'icerik')
                  .map((key) => (
                    <span
                      key={key}
                      className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-200/50 dark:border-slate-800"
                    >
                      {key}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR - FORM / JSON EDITOR */}
          <div className="w-1/3 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {/* TABS */}
            <div className="flex p-2 gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50">
              <button
                onClick={() => setActiveTab('form')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'form'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                Form Görünümü
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'json'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                JSON (Gelişmiş)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 relative flex flex-col">
              {activeTab === 'form' ? (
                <div className="flex flex-col gap-4">
                  {formFields.map((key) => {
                    const originalValue = mergedContext[key]
                    const value =
                      overrideData[key] !== undefined ? overrideData[key] : originalValue
                    const type = typeof originalValue

                    const schemaDef = placeholders.find((p) => p.anahtar === key) || null
                    const label = schemaDef ? schemaDef.etiket : key
                    const effectiveType = schemaDef?.veri_tipi === 'date' ? 'date' : type

                    if (effectiveType === 'date') {
                      let dateVal = value || ''
                      if (typeof value === 'string' && value.includes('.')) {
                        const parts = value.split('.')
                        if (parts.length === 3) {
                          dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`
                        }
                      }

                      return (
                        <div key={key} className="flex flex-col gap-1.5">
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {label}
                            </label>
                            {schemaDef?.aciklama && (
                              <span className="text-xs text-slate-500">{schemaDef.aciklama}</span>
                            )}
                          </div>
                          <input
                            type="date"
                            value={dateVal}
                            onChange={(e) => {
                              const d = e.target.value
                              if (!d) {
                                handleFormChange(key, '')
                                return
                              }
                              const parts = d.split('-')
                              if (parts.length === 3) {
                                handleFormChange(key, `${parts[2]}.${parts[1]}.${parts[0]}`)
                              } else {
                                handleFormChange(key, d)
                              }
                            }}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          />
                        </div>
                      )
                    }

                    if (effectiveType === 'boolean') {
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {label}
                            </label>
                            {schemaDef?.aciklama && (
                              <span className="text-xs text-slate-500">{schemaDef.aciklama}</span>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => handleFormChange(key, e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                      )
                    }

                    if (type === 'number') {
                      return (
                        <div key={key} className="flex flex-col gap-1.5">
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {label}
                            </label>
                            {schemaDef?.aciklama && (
                              <span className="text-xs text-slate-500">{schemaDef.aciklama}</span>
                            )}
                          </div>
                          <input
                            type="number"
                            value={value || 0}
                            onChange={(e) => handleFormChange(key, Number(e.target.value))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          />
                        </div>
                      )
                    }

                    if (Array.isArray(originalValue) || type === 'object') {
                      return (
                        <div key={key} className="flex flex-col gap-1.5">
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {label}{' '}
                              <span className="text-xs font-normal text-slate-400">
                                ({Array.isArray(originalValue) ? 'Dizi' : 'Nesne'})
                              </span>
                            </label>
                            {schemaDef?.aciklama && (
                              <span className="text-xs text-slate-500">{schemaDef.aciklama}</span>
                            )}
                          </div>
                          <textarea
                            value={
                              typeof value === 'object' ? JSON.stringify(value, null, 2) : value
                            }
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(
                                  e.target.value || (Array.isArray(originalValue) ? '[]' : '{}')
                                )
                                handleFormChange(key, parsed)
                              } catch (err) {
                                handleFormChange(key, e.target.value)
                              }
                            }}
                            className="w-full p-2.5 h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                          />
                        </div>
                      )
                    }

                    return (
                      <div key={key} className="flex flex-col gap-1.5">
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {label}
                          </label>
                          {schemaDef?.aciklama && (
                            <span className="text-xs text-slate-500">{schemaDef.aciklama}</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={value || ''}
                          onChange={(e) => handleFormChange(key, e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    )
                  })}
                  {formFields.length === 0 && activePersonnelFields.length === 0 && (
                    <div className="text-center text-sm text-slate-500 mt-10">
                      Bu şablonda otomatik algılanan bir değişken bulunamadı.
                    </div>
                  )}

                  {/* PERSONEL SEÇİM ALANI */}
                  {activePersonnelFields.length > 0 && personelListesi.length > 0 && (
                    <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        Yetkili Personel Seçimi
                      </p>
                      {activePersonnelFields.map((key) => {
                        const field = PERSONNEL_FIELDS[key]
                        const currentValue = overrideData[field.adiKey] ?? mergedContext[field.adiKey] ?? ''

                        return (
                          <div key={key} className="flex flex-col gap-1.5 mb-3">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {field.etiket}
                            </label>
                            <select
                              value={currentValue}
                              onChange={(e) => {
                                const selectedPersonel = personelListesi.find(
                                  (p) => p.ad_soyad === e.target.value
                                )
                                if (selectedPersonel) {
                                  // Hem adı hem unvanı birlikte güncelle
                                  const newData = {
                                    ...overrideData,
                                    [field.adiKey]: selectedPersonel.ad_soyad,
                                    [field.unvanKey]: selectedPersonel.unvan || ''
                                  }
                                  // Türkçe karakter uyumluluk (hazırlayan için)
                                  if (field.adiKey === 'hazirlayanPersonelAdi') {
                                    newData['haz\u0131rlayanPersonelAdi'] = selectedPersonel.ad_soyad
                                    newData['haz\u0131rlayanPersonelUnvan'] = selectedPersonel.unvan || ''
                                    newData['hazirlayanTelefon'] = selectedPersonel.telefon || ''
                                    newData['haz\u0131rlayanTelefon'] = selectedPersonel.telefon || ''
                                    newData['hazirlayanEposta'] = selectedPersonel.eposta || ''
                                    newData['haz\u0131rlayanEposta'] = selectedPersonel.eposta || ''
                                  }
                                  if (field.adiKey === 'onaylayanPersonelAdi') {
                                    newData['baskanAdi'] = selectedPersonel.ad_soyad
                                    newData['baskanUnvan'] = selectedPersonel.unvan || ''
                                  }
                                  setOverrideData(newData)
                                  setOverrideJson(JSON.stringify(newData, null, 2))
                                  const merged = { ...baseContext, ...newData }
                                  updatePreview(merged)
                                } else if (e.target.value === '') {
                                  // Temizle — orijinal değere dön
                                  const newData = { ...overrideData }
                                  delete newData[field.adiKey]
                                  delete newData[field.unvanKey]
                                  setOverrideData(newData)
                                  setOverrideJson(JSON.stringify(newData, null, 2))
                                  const merged = { ...baseContext, ...newData }
                                  updatePreview(merged)
                                }
                              }}
                              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
                            >
                              <option value="">— Dosyadan gelen değer —</option>
                              {personelListesi.map((p) => (
                                <option key={p.id} value={p.ad_soyad}>
                                  {p.ad_soyad}{p.unvan ? ` — ${p.unvan}` : ''}
                                </option>
                              ))}
                            </select>
                            {currentValue && (
                              <span className="text-[10px] text-slate-400">
                                Seçili: {currentValue} — {overrideData[field.unvanKey] ?? mergedContext[field.unvanKey] ?? ''}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3 flex-1 min-h-0">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-2 text-amber-800 dark:text-amber-300 text-xs shadow-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">
                        ⚠️ Gelişmiş Ayarlar (Geliştirici Modu)
                      </span>
                      Değişkenlerin yapısını veya JSON formatını bilmiyorsanız lütfen bu alanlardaki
                      kodları değiştirmeyin. Hatalı JSON dosyanın yazdırılmasını bozabilir.
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/40 rounded-xl flex flex-col gap-2 shadow-sm">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-blue-500" /> AI Değişken Asistanı
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Örn: Tarihi 15.06.2026 yap..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAiEdit}
                        disabled={isAiGenerating || !aiPrompt.trim()}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {isAiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Uygula
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 min-h-[250px]">
                    <Editor
                      height="100%"
                      defaultLanguage="json"
                      theme={
                        document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'
                      }
                      value={overrideJson}
                      onChange={(value) => handleJsonChange(value || '{}')}
                      options={{
                        minimap: { enabled: false },
                        wordWrap: 'on',
                        fontSize: 12,
                        lineNumbers: 'on',
                        folding: true,
                        formatOnPaste: true
                      }}
                    />
                  </div>
                  {jsonError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-955/30 border border-rose-200 dark:border-rose-900/30 rounded-lg flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{jsonError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              İpucu: Buradaki değişiklikler sadece bu yazdırma işlemi için geçerlidir.
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
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex items-center justify-between">
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
              {isProcessingPdf ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              PDF Olarak Kaydet
            </button>
            <button
              onClick={handlePrint}
              disabled={isProcessingPrint || isProcessingPdf || !!jsonError}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
            >
              {isProcessingPrint ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              Yazdır
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-[90vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {title} Önizleme
              </h2>
              <p className="text-xs text-slate-500">
                Form veya JSON üzerinden değişkenleri ezerek sonucu canlı görebilirsiniz.
              </p>
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto custom-scrollbar">
                {Array.from(usedVars)
                  .filter((k) => k !== 'icerik')
                  .map((key) => (
                    <span
                      key={key}
                      className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-200/50 dark:border-slate-800"
                    >
                      {key}
                    </span>
                  ))}
              </div>
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
          {/* LEFT SIDEBAR - FORM / JSON EDITOR */}
          <div className="w-1/3 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {/* TABS */}
            <div className="flex p-2 gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50">
              <button
                onClick={() => setActiveTab('form')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'form'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                Form Görünümü
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'json'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                JSON (Gelişmiş)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 relative flex flex-col">
              {activeTab === 'form' ? (
                <div className="flex flex-col gap-4">
                  {formFields.map((key) => {
                    const originalValue = mergedContext[key]
                    const value =
                      overrideData[key] !== undefined ? overrideData[key] : originalValue
                    const type = typeof originalValue

                    const schemaDef = placeholders.find((p) => p.anahtar === key) || null
                    const label = schemaDef ? schemaDef.etiket : key

                    // Schema-defined types take precedence over typeof for specific UI hints (like date)
                    const effectiveType = schemaDef?.veri_tipi === 'date' ? 'date' : type

                    if (effectiveType === 'date') {
                      // "14.06.2026" gibi TR formatındaki tarihleri YYYY-MM-DD formatına çevir, input type="date" desteklesin
                      let dateVal = value || ''
                      if (typeof value === 'string' && value.includes('.')) {
                        const parts = value.split('.')
                        if (parts.length === 3) {
                          dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`
                        }
                      }

                      return (
                        <div key={key} className="flex flex-col gap-1.5">
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {label}
                            </label>
                            {schemaDef?.aciklama && (
                              <span className="text-xs text-slate-500">{schemaDef.aciklama}</span>
                            )}
                          </div>
                          <input
                            type="date"
                            value={dateVal}
                            onChange={(e) => {
                              // YYYY-MM-DD'den DD.MM.YYYY'ye geri çevir (şablon için)
                              const d = e.target.value
                              if (!d) {
                                handleFormChange(key, '')
                                return
                              }
                              const parts = d.split('-')
                              if (parts.length === 3) {
                                handleFormChange(key, `${parts[2]}.${parts[1]}.${parts[0]}`)
                              } else {
                                handleFormChange(key, d)
                              }
                            }}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          />
                        </div>
                      )
                    }

                    if (effectiveType === 'boolean') {
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {label}
                            </label>
                            {schemaDef?.aciklama && (
                              <span className="text-xs text-slate-500">{schemaDef.aciklama}</span>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => handleFormChange(key, e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                      )
                    }

                    if (type === 'number') {
                      return (
                        <div key={key} className="flex flex-col gap-1.5">
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {label}
                            </label>
                            {schemaDef?.aciklama && (
                              <span className="text-xs text-slate-500">{schemaDef.aciklama}</span>
                            )}
                          </div>
                          <input
                            type="number"
                            value={value || 0}
                            onChange={(e) => handleFormChange(key, Number(e.target.value))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          />
                        </div>
                      )
                    }

                    if (Array.isArray(originalValue) || type === 'object') {
                      return (
                        <div key={key} className="flex flex-col gap-1.5">
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {label}{' '}
                              <span className="text-xs font-normal text-slate-400">
                                ({Array.isArray(originalValue) ? 'Dizi' : 'Nesne'})
                              </span>
                            </label>
                            {schemaDef?.aciklama && (
                              <span className="text-xs text-slate-500">{schemaDef.aciklama}</span>
                            )}
                          </div>
                          <textarea
                            value={
                              typeof value === 'object' ? JSON.stringify(value, null, 2) : value
                            }
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(
                                  e.target.value || (Array.isArray(originalValue) ? '[]' : '{}')
                                )
                                handleFormChange(key, parsed)
                              } catch (err) {
                                // Ignore parse errors while typing
                                handleFormChange(key, e.target.value)
                              }
                            }}
                            className="w-full p-2.5 h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                          />
                        </div>
                      )
                    }

                    // Default to string / text input
                    return (
                      <div key={key} className="flex flex-col gap-1.5">
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {label}
                          </label>
                          {schemaDef?.aciklama && (
                            <span className="text-xs text-slate-500">{schemaDef.aciklama}</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={value || ''}
                          onChange={(e) => handleFormChange(key, e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    )
                  })}
                  {formFields.length === 0 && (
                    <div className="text-center text-sm text-slate-500 mt-10">
                      Bu şablonda otomatik algılanan bir değişken bulunamadı.
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3 flex-1 min-h-0">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-2 text-amber-800 dark:text-amber-300 text-xs shadow-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">
                        ⚠️ Gelişmiş Ayarlar (Geliştirici Modu)
                      </span>
                      Değişkenlerin yapısını veya JSON formatını bilmiyorsanız lütfen bu alanlardaki
                      kodları değiştirmeyin. Hatalı JSON dosyanın yazdırılmasını bozabilir.
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/40 rounded-xl flex flex-col gap-2 shadow-sm">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-blue-500" /> AI Değişken Asistanı
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Örn: Tarihi 15.06.2026 yap..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAiEdit}
                        disabled={isAiGenerating || !aiPrompt.trim()}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {isAiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Uygula
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 min-h-[250px]">
                    <Editor
                      height="100%"
                      defaultLanguage="json"
                      theme={
                        document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'
                      }
                      value={overrideJson}
                      onChange={(value) => handleJsonChange(value || '{}')}
                      options={{
                        minimap: { enabled: false },
                        wordWrap: 'on',
                        fontSize: 12,
                        lineNumbers: 'on',
                        folding: true,
                        formatOnPaste: true
                      }}
                    />
                  </div>
                  {jsonError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-955/30 border border-rose-200 dark:border-rose-900/30 rounded-lg flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{jsonError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              İpucu: Buradaki değişiklikler sadece bu yazdırma işlemi için geçerlidir.
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
              {isProcessingPdf ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              PDF Olarak Kaydet
            </button>
            <button
              onClick={handlePrint}
              disabled={isProcessingPrint || isProcessingPdf || !!jsonError}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm shadow-blue-600/20"
            >
              {isProcessingPrint ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              Yazdır
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
