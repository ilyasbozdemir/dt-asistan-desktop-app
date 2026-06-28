import React, { useState, useRef, useEffect } from 'react'
import { FileText, ChevronDown, Search, FolderClosed, Plus, TrendingUp } from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useDosyalarHooks } from '../../screens/dosyalar/dosyalar.hooks'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '../../utils/cn'

export function TeminSelector(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const { activeDosyaId, setActiveDosyaId, setIsCreatingDosya } = useWorkspaceStore()
  const { dosyalar, isLoadingDosyalar } = useDosyalarHooks()
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedDosya = dosyalar.find((d) => d.id === activeDosyaId)

  const filteredDosyalar = dosyalar.filter(
    (d) =>
      d.is_deleted !== 1 &&
      (d.konu?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.temin_no?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleSelect = (id: number): void => {
    setActiveDosyaId(id)
    setIsOpen(false)
    navigate({ to: '/dosya' })
  }

  const handleCreateYeniDosya = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setIsCreatingDosya(true)
    setIsOpen(false)
    navigate({ to: '/dosyalar' })
  }

  const turLabel: Record<string, string> = {
    mal: 'Mal',
    hizmet: 'Hizmet',
    yapim_isi: 'Yapım',
    danismanlik: 'Danış.'
  }

  const turColor: Record<string, string> = {
    mal: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
    hizmet: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
    yapim_isi: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
    danismanlik: 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300'
  }

  const formatMoney = (val: number) =>
    val
      ? val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0,00'

  return (
    <div className="relative" ref={containerRef}>
      {selectedDosya ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-3 px-5 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 shadow-sm hover:shadow-md min-w-[500px] max-w-[1000px] w-auto"
          title="Dosya Değiştir"
        >
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                {selectedDosya.temin_no || 'NO BEKLİYOR'}
              </span>
              {selectedDosya.tur && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide ${turColor[selectedDosya.tur] ?? 'bg-slate-100 text-slate-500'}`}
                >
                  {turLabel[selectedDosya.tur] ?? selectedDosya.tur}
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate leading-tight group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
              {selectedDosya.konu}
            </div>
          </div>

          {selectedDosya.yaklasik_maliyet ? (
            <div className="flex items-center gap-1 shrink-0 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap tracking-tight">
                ₺{formatMoney(selectedDosya.yaklasik_maliyet)}
              </span>
            </div>
          ) : null}

          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-medium border border-dashed border-slate-200 dark:border-slate-700 min-w-[500px] justify-center"
          title="Dosya Seçmek İçin Tıkla"
        >
          <FileText className="w-4 h-4" />
          Çalışmak İstediğiniz Dosyayı Seçin...
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform duration-200 ml-2',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      )}

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-[850px] max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="relative flex items-center p-2 border-b border-slate-100 dark:border-slate-800 mb-2">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Dosya no veya konu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleCreateYeniDosya}
              className="absolute right-2 p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Yeni Temin Dosyası Ekle"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-0.5 p-1">
            {isLoadingDosyalar ? (
              <div className="p-6 text-center text-sm text-slate-500">Yükleniyor...</div>
            ) : filteredDosyalar.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400 flex flex-col items-center gap-3">
                <FolderClosed className="w-8 h-8 opacity-40" />
                <span>Temin dosyası bulunamadı.</span>
                <button
                  onClick={handleCreateYeniDosya}
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Yeni Dosya Tanımla
                </button>
              </div>
            ) : (
              filteredDosyalar.map((dosya) => (
                <button
                  key={dosya.id}
                  onClick={() => handleSelect(dosya.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent',
                    activeDosyaId === dosya.id &&
                      'bg-blue-50/70 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
                  )}
                >
                  <FileText
                    className={cn(
                      'w-5 h-5 shrink-0',
                      activeDosyaId === dosya.id
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        {dosya.temin_no || 'NO BEKLİYOR'}
                      </span>
                      {dosya.tur && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide ${turColor[dosya.tur] ?? 'bg-slate-100 text-slate-500'}`}
                        >
                          {turLabel[dosya.tur] ?? dosya.tur}
                        </span>
                      )}
                    </div>
                    <div
                      className={cn(
                        'text-sm font-bold truncate',
                        activeDosyaId === dosya.id
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-slate-700 dark:text-slate-200'
                      )}
                    >
                      {dosya.konu}
                    </div>
                  </div>
                  {dosya.yaklasik_maliyet ? (
                    <div className="flex items-center gap-1 shrink-0 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap tracking-tight">
                        ₺{formatMoney(dosya.yaklasik_maliyet)}
                      </span>
                    </div>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
