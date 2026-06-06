import React, { useState } from 'react'
import { X, Search, FileText, Calendar, Copy, ChevronRight } from 'lucide-react'
import { TeminDosyasi } from '../dosyalar.hooks'
import { cn } from '../../../utils/cn'

interface EskiDosyaKopyalaModalProps {
  isOpen: boolean
  onClose: () => void
  dosyalar: TeminDosyasi[]
  onSelect: (dosya: TeminDosyasi) => void
}

export function EskiDosyaKopyalaModal({
  isOpen,
  onClose,
  dosyalar,
  onSelect
}: EskiDosyaKopyalaModalProps) {
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  // Filtreleme: Arama metni ve isim boş olmayanları getir
  const filteredDosyalar = dosyalar.filter(d => {
    const q = searchQuery.toLowerCase()
    return (
      (d.konu && d.konu.toLowerCase().includes(q)) ||
      (d.temin_no && d.temin_no.toLowerCase().includes(q)) ||
      (d.birim_adi && d.birim_adi.toLowerCase().includes(q))
    )
  })

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Copy className="text-blue-600" size={20} />
              Eski Dosyadan Kopyala (Şablon Yap)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Geçmişteki bir alımı seçerek formun %80'ini otomatik doldurun.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl transition-colors shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Dosya numarası, konu veya birim ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-slate-200"
              autoFocus
            />
          </div>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto p-2 bg-slate-50/50 dark:bg-slate-950/50 custom-scrollbar">
          {filteredDosyalar.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-slate-400" size={24} />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Dosya Bulunamadı</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Arama kriterinize uygun geçmiş alım dosyası yok.
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredDosyalar.map((dosya) => (
                <button
                  key={dosya.id}
                  onClick={() => onSelect(dosya)}
                  className="w-full text-left p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all group flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {dosya.temin_no || 'NO BELİRSİZ'}
                      </span>
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                        dosya.tur === 'mal' ? "bg-blue-100 text-blue-700" :
                        dosya.tur === 'hizmet' ? "bg-violet-100 text-violet-700" :
                        "bg-amber-100 text-amber-700"
                      )}>
                        {dosya.tur === 'mal' ? 'MAL' : dosya.tur === 'hizmet' ? 'HİZMET' : dosya.tur === 'yapim_isi' ? 'YAPIM' : 'DANIŞMANLIK'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {dosya.konu}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                      <span className="truncate max-w-[200px]" title={dosya.birim_adi || ''}>
                        🏢 {dosya.birim_adi || 'Birim Yok'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {dosya.dosya_acilis_tarihi ? new Date(dosya.dosya_acilis_tarihi).toLocaleDateString('tr-TR') : '-'}
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        ₺ {dosya.yaklasik_maliyet ? dosya.yaklasik_maliyet.toLocaleString('tr-TR') : '0'}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all text-slate-400 shrink-0">
                    <ChevronRight size={18} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
