import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Zap,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  Bot,
  User2
} from 'lucide-react'
import { cn } from '../../utils/cn'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AIFormContext {
  /** Form hakkında genel bilgi (hangi form olduğu, hangi ekran) */
  formTitle: string
  /** Kurum / Birim bilgisi */
  kurumBilgisi?: {
    birimAdi?: string
    sunulacakMakam?: string
    antetEkSatir?: string
    ihtiyacYeri?: string
    kurumAdi?: string
  }
  /** Mevcut form değerleri (dolu olanlar) */
  mevcutDegerler?: Record<string, string | number | null | undefined>
  /** Doldurulması istenen alanlar */
  doldurulacakAlanlar: Array<{
    alan: string // "konu", "isin_aciklamasi" vb.
    etiket: string // "İhale Konusu", "İşin Açıklaması" vb.
    tip?: 'text' | 'textarea' | 'date' | 'select' | 'number'
    zorunlu?: boolean
    ornekDeger?: string
  }>
}

export interface AIFilledValues {
  [key: string]: string | number
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIFormFillModalProps {
  isOpen: boolean
  onClose: () => void
  context: AIFormContext
  /** Hızlı Doldur sonucunda çağrılır */
  onApply: (values: AIFilledValues) => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildQuickFillPrompt(context: AIFormContext): string {
  const { formTitle, kurumBilgisi, mevcutDegerler, doldurulacakAlanlar } = context

  const kurumStr = kurumBilgisi
    ? `
Kurum/Birim Bilgileri:
- Birim Adı: ${kurumBilgisi.birimAdi || 'Belirtilmemiş'}
- Sunulacak Makam: ${kurumBilgisi.sunulacakMakam || 'Belirtilmemiş'}
- Antet Ek Satır: ${kurumBilgisi.antetEkSatir || 'Belirtilmemiş'}
- İhtiyaç Yeri: ${kurumBilgisi.ihtiyacYeri || 'Belirtilmemiş'}
- Kurum Adı: ${kurumBilgisi.kurumAdi || 'Belirtilmemiş'}`
    : ''

  const mevcutStr = mevcutDegerler
    ? `\nMevcut Dolu Alanlar:\n${Object.entries(mevcutDegerler)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n')}`
    : ''

  const alanlarStr = doldurulacakAlanlar
    .map(
      (a) =>
        `- ${a.alan} (${a.etiket})${a.zorunlu ? ' [ZORUNLU]' : ''}${a.ornekDeger ? ` [Örnek: ${a.ornekDeger}]` : ''}`
    )
    .join('\n')

  return `Sen bir Türk kamu ihale uzmanısın. Aşağıdaki form için uygun değerleri üret.

Form: ${formTitle}
${kurumStr}
${mevcutStr}

Doldurulacak Alanlar:
${alanlarStr}

KURALLAR:
1. Yanıtını SADECE geçerli bir JSON objesi olarak ver, başka açıklama ekleme
2. JSON key'leri yukarıdaki "alan" değerleri olmalı
3. Boş bırakmamana gerek yok, her alanı doldur
4. Resmi dil kullan (kurum adında gerçek isim varsa onu kullan, yoksa [KURUM ADI] yaz)
5. Tarih alanları için YYYY-MM-DD formatı kullan

Yanıtını sadece bu şekilde ver:
{"alan1": "değer1", "alan2": "değer2", ...}`
}

function buildChatSystemPrompt(context: AIFormContext): string {
  const { formTitle, kurumBilgisi, mevcutDegerler, doldurulacakAlanlar } = context

  const kurumStr = kurumBilgisi
    ? `
**Kurum Bilgileri:**
- Birim: ${kurumBilgisi.birimAdi || 'Belirtilmemiş'}
- Sunulacak Makam: ${kurumBilgisi.sunulacakMakam || 'Belirtilmemiş'}
- Antet: ${kurumBilgisi.antetEkSatir || 'Belirtilmemiş'}
- İhtiyaç Yeri: ${kurumBilgisi.ihtiyacYeri || 'Belirtilmemiş'}`
    : ''

  const mevcutStr = mevcutDegerler
    ? Object.entries(mevcutDegerler)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n')
    : 'Henüz dolu alan yok.'

  const alanlarStr = doldurulacakAlanlar.map((a) => `- ${a.etiket}`).join('\n')

  return `Sen DT (Doğrudan Temin) uygulamasında çalışan bir Türk kamu ihale asistanısın.
Görevin: "${formTitle}" formunu kullanıcıyla sohbet ederek doldurmaya yardım etmek.

${kurumStr}

Mevcut Değerler:
${mevcutStr}

Doldurulacak Alanlar:
${alanlarStr}

Kullanıcı sana ne almak istediğini söylediğinde, o alıma göre tüm form alanlarını JSON formatında üret.
Sohbet sonunda kullanıcı "Uygula" dediğinde veya memnun olduğunda şu formatla yanıt ver:
<APPLY>{"alan1": "değer1", ...}</APPLY>

Türkçe konuş. Kısa ve net cevaplar ver. Resmi kurumsal dil kullan.`
}

function tryParseApplyBlock(text: string): AIFilledValues | null {
  const match = text.match(/<APPLY>([\s\S]*?)<\/APPLY>/)
  if (!match) return null
  try {
    return JSON.parse(match[1].trim())
  } catch {
    return null
  }
}

function tryParseJson(text: string): AIFilledValues | null {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

// ─── Preview Panel ────────────────────────────────────────────────────────────

function PreviewPanel({
  values,
  context,
  onApply
}: {
  values: AIFilledValues
  context: AIFormContext
  onApply: (values: AIFilledValues) => void
}) {
  if (Object.keys(values).length === 0) return null
  return (
    <div className="mt-3 border border-emerald-200 dark:border-emerald-800 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 size={13} /> Doldurulacak Değerler
        </span>
        <button
          onClick={() => onApply(values)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Sparkles size={12} /> Forma Uygula
        </button>
      </div>

      <div className="mt-2 mb-1 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-semibold flex items-start gap-1.5 leading-relaxed">
        <span className="text-xs mt-0.5">⚠️</span>
        <span>
          Yapay zekanın tahmin ettiği ekonomik kodlar, tarihler ve bütçe hesaplamaları hata
          içerebilir. Lütfen doğruluğunu <b>teyit edip</b> uygulayınız.
        </span>
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
        {context.doldurulacakAlanlar
          .filter((a) => values[a.alan] !== undefined)
          .map((a) => (
            <div key={a.alan} className="flex gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 min-w-[120px] truncate">
                {a.etiket}:
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                {String(values[a.alan])}
              </span>
            </div>
          ))}
      </div>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function AIFormFillModal({ isOpen, onClose, context, onApply }: AIFormFillModalProps) {
  const [mode, setMode] = useState<'select' | 'quick' | 'chat'>('select')

  // Quick fill state
  const [quickLoading, setQuickLoading] = useState(false)
  const [quickResult, setQuickResult] = useState<AIFilledValues | null>(null)
  const [quickError, setQuickError] = useState('')

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatPendingApply, setChatPendingApply] = useState<AIFilledValues | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setMode('select')
      setQuickResult(null)
      setQuickError('')
      setChatMessages([])
      setChatPendingApply(null)
      setChatInput('')
    }
  }, [isOpen])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // ── Quick Fill ──────────────────────────────────────────────────────────────
  const handleQuickFill = async () => {
    setQuickLoading(true)
    setQuickResult(null)
    setQuickError('')
    try {
      const prompt = buildQuickFillPrompt(context)
      const res = await window.api.aiGenerate({ prompt })
      if (res.success && res.data) {
        const parsed = tryParseJson(res.data)
        if (parsed) {
          setQuickResult(parsed)
        } else {
          setQuickError('AI geçerli bir JSON döndürmedi. Tekrar deneyin.')
        }
      } else {
        setQuickError(
          res.error || 'AI hatası. Ayarlar > Yapay Zeka bölümünden API anahtarınızı kontrol edin.'
        )
      }
    } catch {
      setQuickError('Beklenmeyen hata oluştu.')
    } finally {
      setQuickLoading(false)
    }
  }

  // ── Chat ────────────────────────────────────────────────────────────────────
  const handleChatStart = () => {
    setMode('chat')
    const welcome: ChatMessage = {
      role: 'assistant',
      content: `Merhaba! Ben DT Asistanınızım 👋\n\n**${context.formTitle}** formunu doldurmana yardımcı olabilirim.\n\nHızlı bir şekilde doldurmak için bana şunu söyle:\n> "X malzemesi alımı için ihale dosyası aç"\n\nYa da adım adım gidelim — hangi birimin alımı bu?`,
      timestamp: new Date()
    }
    setChatMessages([welcome])
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleSendMessage = async () => {
    const text = chatInput.trim()
    if (!text || chatLoading) return

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() }
    setChatMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      const systemPrompt = buildChatSystemPrompt(context)
      const history = [...chatMessages, userMsg]
      const conversationText = history
        .map((m) => `${m.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${m.content}`)
        .join('\n\n')

      const prompt = `${systemPrompt}\n\n--- SOHBET GEÇMİŞİ ---\n${conversationText}\n\nAsistan:`
      const res = await window.api.aiGenerate({ prompt })

      if (res.success && res.data) {
        const aiText = res.data.trim()
        const applyValues = tryParseApplyBlock(aiText)
        const cleanText = aiText.replace(/<APPLY>[\s\S]*?<\/APPLY>/, '').trim()

        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: cleanText || 'Form değerleri hazır! Aşağıdan uygulayabilirsin.',
          timestamp: new Date()
        }
        setChatMessages((prev) => [...prev, assistantMsg])

        if (applyValues) {
          setChatPendingApply(applyValues)
        }
      } else {
        const errMsg: ChatMessage = {
          role: 'assistant',
          content: `⚠️ Hata: ${res.error || 'AI yanıt vermedi.'}`,
          timestamp: new Date()
        }
        setChatMessages((prev) => [...prev, errMsg])
      }
    } catch {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: '⚠️ Beklenmeyen hata oluştu.',
        timestamp: new Date()
      }
      setChatMessages((prev) => [...prev, errMsg])
    } finally {
      setChatLoading(false)
    }
  }

  const handleApplyAndClose = (values: AIFilledValues) => {
    onApply(values)
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

      {/* Panel */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden',
          'animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300',
          mode === 'chat' ? 'max-w-2xl h-[85vh]' : 'max-w-xl'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                AI ile Forma Yardım
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{context.formTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Mode Select ── */}
        {mode === 'select' && (
          <div className="p-5 space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formu nasıl doldurmak istiyorsunuz?
            </p>

            {/* Quick Fill */}
            <button
              onClick={() => {
                setMode('quick')
                handleQuickFill()
              }}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-xl hover:border-amber-400 dark:hover:border-amber-600 transition-all group text-left"
            >
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center flex-none group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Hızlı Doldur
                  </span>
                  <span className="text-[10px] bg-amber-500 text-white rounded-full px-2 py-0.5 font-bold">
                    ÖNERİLEN
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kurum bilgilerini bilerek formu tek hamlede doldurur. Onaylamanız yeterli.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors flex-none" />
            </button>

            {/* Chat Mode */}
            <button
              onClick={handleChatStart}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800 rounded-xl hover:border-purple-400 dark:hover:border-purple-600 transition-all group text-left"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center flex-none group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Sohbet Modu
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Asistana ne almak istediğinizi anlatın, o formu adım adım doldursun.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors flex-none" />
            </button>

            {/* Context info */}
            {context.kurumBilgisi?.birimAdi && (
              <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg p-3">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Kullanılacak Bağlam:
                  </span>{' '}
                  {context.kurumBilgisi.birimAdi}
                  {context.kurumBilgisi.sunulacakMakam &&
                    ` · ${context.kurumBilgisi.sunulacakMakam}`}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Quick Fill ── */}
        {mode === 'quick' && (
          <div className="p-5 space-y-4">
            {quickLoading && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center animate-pulse">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  AI formu doldururken...
                </p>
                <p className="text-xs text-slate-400">Kurum bilgileri analiz ediliyor</p>
              </div>
            )}

            {quickError && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400">
                ⚠️ {quickError}
              </div>
            )}

            {quickResult && (
              <>
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={16} /> Form değerleri hazır!
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  {context.doldurulacakAlanlar.map((a) => {
                    const val = quickResult[a.alan]
                    if (val === undefined) return null
                    return (
                      <div
                        key={a.alan}
                        className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <span className="text-slate-500 dark:text-slate-400 w-32 flex-none font-medium truncate">
                          {a.etiket}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 flex-1 min-w-0">
                          {String(val)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleApplyAndClose(quickResult)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                  >
                    <Sparkles size={15} /> Forma Uygula
                  </button>
                  <button
                    onClick={handleQuickFill}
                    title="Yeniden üret"
                    className="px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
              </>
            )}

            {!quickLoading && !quickResult && !quickError && (
              <div className="text-center text-sm text-slate-400 py-6">Hazırlanıyor...</div>
            )}

            <button
              onClick={() => {
                setMode('select')
                setQuickResult(null)
                setQuickError('')
              }}
              className="w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              ← Geri
            </button>
          </div>
        )}

        {/* ── Chat Mode ── */}
        {mode === 'chat' && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex gap-2.5',
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center flex-none',
                      msg.role === 'assistant'
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                        : 'bg-slate-200 dark:bg-slate-700'
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <Bot className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <User2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed',
                      msg.role === 'assistant'
                        ? 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                        : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-tr-sm'
                    )}
                  >
                    {msg.content.split('\n').map((line, li) => (
                      <p key={li}>{line || <br />}</p>
                    ))}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-none">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                  </div>
                </div>
              )}

              {chatPendingApply && (
                <div className="mx-2">
                  <PreviewPanel
                    values={chatPendingApply}
                    context={context}
                    onApply={handleApplyAndClose}
                  />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex-none border-t border-slate-100 dark:border-slate-800 p-3">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef as any}
                  rows={2}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Mesaj yazın... (örn: Fen İşleri kırtasiye alımı için doldur)"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-800 dark:text-slate-200 placeholder-slate-400 custom-scrollbar resize-none"
                  disabled={chatLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-3.5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {chatLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 text-center">
                Asistan formu doldurduğunda "Forma Uygula" butonu görünür
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
