import React from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'

export const DisclaimerModal: React.FC = () => {
  const { isDisclaimerAccepted, setDisclaimerAccepted, disclaimerHistory, setDisclaimerHistory } =
    useSettingsStore()

  if (isDisclaimerAccepted) return null

  const handleAccept = async () => {
    try {
      // Save locally
      setDisclaimerAccepted(true)

      let historyArray: string[] = []
      try {
        if (disclaimerHistory) {
          historyArray = JSON.parse(disclaimerHistory)
          if (!Array.isArray(historyArray)) historyArray = []
        }
      } catch (e) {
        historyArray = []
      }

      historyArray.push(new Date().toISOString())
      const newHistory = JSON.stringify(historyArray)
      setDisclaimerHistory(newHistory)

      // Save to db
      await window.electron.ipcRenderer.invoke('db:save-settings', {
        isDisclaimerAccepted: 'true',
        disclaimerHistory: newHistory
      })
    } catch (error) {
      console.error('Sorumluluk reddi kaydedilirken hata oluştu:', error)
      // Fallback
      setDisclaimerAccepted(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Yasal Uyarı ve Sorumluluk Reddi
            </h2>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 font-medium mt-1">
              Lütfen kullanıma başlamadan önce okuyun.
            </p>
          </div>
        </div>

        <div className="p-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
          <p>
            Bu uygulama, kamu kurumları ve kuruluşlarının Doğrudan Temin süreçlerini
            dijitalleştirmek amacıyla yardımcı bir araç olarak geliştirilmiştir.
          </p>
          <p>
            Uygulama üzerinden üretilen hesaplamaların, belgelerin ve raporların doğruluğunu, yasal
            mevzuata uygunluğunu ve güncelliğini kontrol etmek tamamen{' '}
            <strong>kullanıcının sorumluluğundadır</strong>.
          </p>
          <p className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 italic">
            Geliştirici, hatalı hesaplamalar veya mevzuata aykırı işlemlerden doğabilecek hukuki,
            idari ve mali sorumlulukları kabul etmez.
          </p>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={handleAccept}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm shadow-blue-600/20"
          >
            <CheckCircle className="w-4 h-4" />
            Anladım, Kabul Ediyorum
          </button>
        </div>
      </div>
    </div>
  )
}
