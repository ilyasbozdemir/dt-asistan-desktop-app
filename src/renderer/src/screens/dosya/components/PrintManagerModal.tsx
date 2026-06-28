import React from 'react'
import { X, Printer, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react'
import { Sablon } from '../../sablonlar/sablonlar.hooks'

interface PrintManagerModalProps {
  isOpen: boolean
  onClose: () => void
  sablons: Sablon[]
  activeStarredDocs: string[]
  selectedIds: Set<number>
  onRemoveFromQueue: (sablonId: number) => void
  onPrint: (validSablonIds: number[]) => Promise<void>
  processing: boolean
  normalizeForMatch: (str: string) => string
  getMissingRequirement: (sablon: Sablon) => string | null
}

export function PrintManagerModal({
  isOpen,
  onClose,
  sablons,
  activeStarredDocs,
  selectedIds,
  onRemoveFromQueue,
  onPrint,
  processing,
  normalizeForMatch,
  getMissingRequirement
}: PrintManagerModalProps) {
  if (!isOpen) return null

  const queueItems = React.useMemo(() => {
    const items = new Map<number, Sablon>()

    // 1. Seçili olanları ekle
    sablons.forEach((s) => {
      if (selectedIds.has(s.id)) {
        items.set(s.id, s)
      }
    })

    // 2. Hızlı erişimdekileri ekle
    activeStarredDocs.forEach((docName) => {
      const sablon = sablons.find((s) => normalizeForMatch(s.ad) === normalizeForMatch(docName))
      if (sablon && !items.has(sablon.id)) {
        items.set(sablon.id, sablon)
      }
    })

    return Array.from(items.values())
  }, [sablons, activeStarredDocs, selectedIds, normalizeForMatch])

  const validItems = queueItems.filter((s) => !getMissingRequirement(s))
  const invalidItems = queueItems.filter((s) => getMissingRequirement(s))
  const canPrint = validItems.length > 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <Printer className="w-6 h-6 text-blue-500" />
              Yazdırma Yöneticisi
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Kuyruktaki toplam belge sayısı:{' '}
              <strong className="text-slate-700 dark:text-slate-300">{queueItems.length}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {queueItems.length === 0 ? (
            <div className="text-center py-12">
              <Printer className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                Kuyruk Boş
              </h3>
              <p className="text-sm text-slate-500">
                Yazdırmak için sol taraftan belge seçin veya hızlı erişime belge ekleyin.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queueItems.map((sablon) => {
                const missingMsg = getMissingRequirement(sablon)
                return (
                  <div
                    key={sablon.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border ${
                      missingMsg
                        ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30'
                        : 'bg-white border-slate-200 dark:bg-slate-900/50 dark:border-slate-800'
                    }`}
                  >
                    <div className="shrink-0">
                      {missingMsg ? (
                        <AlertCircle className="w-6 h-6 text-rose-500" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold truncate ${missingMsg ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        {sablon.ad}
                      </p>
                      {missingMsg ? (
                        <p className="text-[11px] text-rose-500 mt-0.5">Eksik Veri: {missingMsg}</p>
                      ) : (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-0.5">
                          Yazdırmaya Hazır
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onRemoveFromQueue(sablon.id)}
                      className="shrink-0 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                      title="Kuyruktan Çıkar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">
              <span className="text-slate-500">Yazdırılacak Belge: </span>
              <strong className="text-emerald-600 dark:text-emerald-500">
                {validItems.length}
              </strong>
              {invalidItems.length > 0 && (
                <span className="text-rose-500 ml-2">(Engellenen: {invalidItems.length})</span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all"
            >
              İptal
            </button>
            <button
              onClick={() => onPrint(validItems.map((s) => s.id))}
              disabled={!canPrint || processing}
              className={`flex-[2] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                canPrint && !processing
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              {processing ? (
                <>Yazdırılıyor...</>
              ) : (
                <>
                  <Printer className="w-5 h-5" />
                  Sırayla Yazdır ({validItems.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
