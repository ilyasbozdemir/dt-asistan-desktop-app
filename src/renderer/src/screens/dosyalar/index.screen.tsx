import React, { useState, useEffect } from 'react'
import { useDosyalarHooks } from './dosyalar.hooks'
import { useTabStore } from '../../store/tabStore'
import { useRouterState, useNavigate } from '@tanstack/react-router'
import {
  Search,
  Plus,
  FileText,
  ChevronRight,
  Trash2,
  Edit,
  Calendar,
  Grid,
  List,
  ExternalLink,
  Building2,
  Hash,
  TrendingUp,
  DollarSign,
  ClipboardList,
  User,
  BookOpen,
  BadgePercent,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useWorkspaceStore } from '../../store/workspaceStore'

// Tur badge renk ve label helper
function TurBadge({ tur }: { tur: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    mal: { label: 'Mal', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    hizmet: { label: 'Hizmet', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    yapim_isi: { label: 'Yapım', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    danismanlik: { label: 'Danışmanlık', cls: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' }
  }
  const { label, cls } = map[tur] ?? { label: tur, cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' }
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide', cls)}>
      {label}
    </span>
  )
}

// Durum badge helper (durum_asama_id null ise "Taslak")
function DurumBadge({ durumAsamaId }: { durumAsamaId: number | null }) {
  if (!durumAsamaId) {
    return (
      <span className="flex items-center gap-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-500">
        <Clock size={9} /> Taslak
      </span>
    )
  }
  return (
    <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 size={9} /> Aktif
    </span>
  )
}

export default function DosyalarScreen(): React.ReactNode {
  const { dosyalar, isLoadingDosyalar, deleteDosya } = useDosyalarHooks()
  const { activeDosyaId, setActiveDosyaId } = useWorkspaceStore()
  const { updateTabLabel } = useTabStore()
  const routerState = useRouterState()
  const navigate = useNavigate()

  const searchParams = new URLSearchParams(window.location.search)
  const isWindowMode = searchParams.get('mode') === 'window'
  const urlId = searchParams.get('id')

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [filterTur, setFilterTur] = useState<string>('hepsi')

  const fileId = urlId ? parseInt(urlId, 10) : activeDosyaId
  const selectedDosya = dosyalar.find((d) => d.id === fileId)

  // Dinamik tab label
  useEffect(() => {
    if (isWindowMode) return
    const currentHref = routerState.location.href
    if (selectedDosya) {
      updateTabLabel(currentHref, `DT: ${selectedDosya.konu}`)
    } else {
      updateTabLabel(currentHref, 'Doğrudan Temin')
    }
  }, [selectedDosya, routerState.location.href, updateTabLabel, isWindowMode])

  const handleOpenInNewWindow = () => {
    if (!selectedDosya) return
    window.electron?.ipcRenderer.send('window:open-secondary', {
      path: '/dosyalar',
      search: `?id=${selectedDosya.id}&mode=window`,
      title: `DT: ${selectedDosya.konu}`
    })
  }

  const handleDelete = async (id: number): Promise<void> => {
    if (confirm('Bu dosyayı silmek istediğinize emin misiniz?')) {
      await deleteDosya(id)
      if (activeDosyaId === id) setActiveDosyaId(null)
    }
  }

  const filteredDosyalar = dosyalar.filter((d) => {
    const matchSearch =
      (d.konu || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.temin_no || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.birim_adi || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchTur = filterTur === 'hepsi' || d.tur === filterTur
    return matchSearch && matchTur
  })

  // İstatistikler
  const toplamMaliyet = dosyalar.reduce((s, d) => s + (d.yaklasik_maliyet || 0), 0)
  const aktifCount = dosyalar.filter(d => d.durum_asama_id).length
  const taslakCount = dosyalar.filter(d => !d.durum_asama_id).length

  const formatMoney = (val: number) =>
    val ? val.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0.00'

  const formatDate = (val: string | null | undefined) => {
    if (!val) return '-'
    return new Date(val).toLocaleDateString('tr-TR')
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-4 md:p-6 overflow-hidden gap-4">
      {/* ÜST BAR */}
      <div className="flex-none flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-850 dark:text-white flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            Doğrudan Temin İhale Dosyaları
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            İhale süreçlerinizi başlatın, tekliflerinizi ve yaklaşık maliyetlerinizi takip edin.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* ARAMA */}
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Konu, numara veya birim ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* VIEW SWITCHER */}
          <div className="flex bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                viewMode === 'card'
                  ? 'bg-slate-100 dark:bg-slate-800 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              )}
              title="Kart Görünümü"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                viewMode === 'table'
                  ? 'bg-slate-100 dark:bg-slate-800 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              )}
              title="Tablo Görünümü"
            >
              <List size={16} />
            </button>
          </div>

          {/* YENİ EKLE */}
          <button
            onClick={() => navigate({ to: '/dosyalar/yeni' })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus size={16} />
            Yeni Dosya
          </button>
        </div>
      </div>

      {/* ÖZET İSTATİSTİK BARI */}
      <div className="flex-none grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <FileText size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium">Toplam Dosya</p>
            <p className="text-lg font-black text-slate-800 dark:text-white leading-tight">{dosyalar.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium">Aktif</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-tight">{aktifCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <Clock size={16} className="text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium">Taslak</p>
            <p className="text-lg font-black text-slate-600 dark:text-slate-300 leading-tight">{taslakCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <DollarSign size={16} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium">Toplam Yaklaşık Maliyet</p>
            <p className="text-sm font-black text-green-600 dark:text-green-400 leading-tight">₺ {formatMoney(toplamMaliyet)}</p>
          </div>
        </div>
      </div>

      {/* FİLTRE SATIRI */}
      <div className="flex-none flex gap-1.5">
        {['hepsi', 'mal', 'hizmet', 'yapim_isi', 'danismanlik'].map(t => (
          <button
            key={t}
            onClick={() => setFilterTur(t)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer border',
              filterTur === t
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            )}
          >
            {t === 'hepsi' ? 'Tümü' : t === 'mal' ? 'Mal' : t === 'hizmet' ? 'Hizmet' : t === 'yapim_isi' ? 'Yapım' : 'Danışmanlık'}
          </button>
        ))}
        {filteredDosyalar.length < dosyalar.length && (
          <span className="ml-auto text-[10px] text-slate-500 self-center">
            {filteredDosyalar.length} / {dosyalar.length} dosya gösteriliyor
          </span>
        )}
      </div>

      {/* İÇERİK - İKİ SÜTUN YAPI */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 overflow-hidden">
        {/* SOL TARAF: LİSTE VEYA KARTLAR */}
        <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col h-full overflow-hidden">
          {isLoadingDosyalar ? (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-500 italic">Dosyalar yükleniyor...</div>
          ) : filteredDosyalar.length === 0 ? (
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Temin Dosyası Bulunamadı</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Arama kriterlerinize uyan veya kayıtlı herhangi bir doğrudan temin dosyası bulunmamaktadır.
              </p>
              <button
                onClick={() => navigate({ to: '/dosyalar/yeni' })}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Yeni Temin Dosyası Ekle
              </button>
            </div>
          ) : viewMode === 'card' ? (
            /* KART GÖRÜNÜMÜ */
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 content-start">
              {filteredDosyalar.map((dosya) => (
                <div
                  key={dosya.id}
                  onClick={() => setActiveDosyaId(dosya.id)}
                  className={cn(
                    'bg-white dark:bg-slate-900 border rounded-2xl cursor-pointer hover:shadow-lg transition-all flex flex-col group relative overflow-hidden',
                    activeDosyaId === dosya.id
                      ? 'border-blue-500 dark:border-blue-700 ring-2 ring-blue-500/15 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  {/* Kart Başlık Bölümü */}
                  <div className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800 truncate max-w-[120px]">
                        {dosya.temin_no || 'NO BELİRSİZ'}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <DurumBadge durumAsamaId={dosya.durum_asama_id} />
                        <TurBadge tur={dosya.tur} />
                      </div>
                    </div>

                    <h3
                      className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      title={dosya.konu}
                    >
                      {dosya.konu}
                      {dosya.tekrar_no && dosya.tekrar_no > 1 ? (
                        <span className="ml-1 text-[9px] font-black text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1 py-0.5 rounded">
                          #{dosya.tekrar_no}
                        </span>
                      ) : null}
                    </h3>
                  </div>

                  {/* Birim */}
                  <div className="px-4 py-2 bg-blue-50/40 dark:bg-blue-950/20 border-b border-blue-100/50 dark:border-blue-900/20 flex items-center gap-1.5">
                    <Building2 size={10} className="text-blue-500 shrink-0" />
                    <span className="text-[9px] font-semibold text-blue-700 dark:text-blue-400 truncate">
                      {dosya.birim_adi || 'Birim Seçilmemiş'}
                    </span>
                  </div>

                  {/* Açıklama */}
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/60">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[28px]">
                      {dosya.isin_aciklamasi || <span className="italic text-slate-350 dark:text-slate-600">Açıklama girilmemiş.</span>}
                    </p>
                  </div>

                  {/* Detay Grid */}
                  <div className="px-4 py-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px] border-b border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-1 truncate">
                      <BookOpen size={9} className="text-slate-400 shrink-0" />
                      <span className="text-slate-400 font-semibold shrink-0">Madde:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{dosya.ihale_sekli || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <Calendar size={9} className="text-slate-400 shrink-0" />
                      <span className="text-slate-400 font-semibold shrink-0">Bütçe:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{dosya.butce_yili || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <ClipboardList size={9} className="text-slate-400 shrink-0" />
                      <span className="text-slate-400 font-semibold shrink-0">Sözleşme:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{dosya.teklif_sozlesme_turu || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <Hash size={9} className="text-slate-400 shrink-0" />
                      <span className="text-slate-400 font-semibold shrink-0">Ek. Kodu:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate font-mono" title={dosya.ekonomik_kod || ''}>
                        {dosya.ekonomik_kod || '-'}
                      </span>
                    </div>
                    {dosya.talep_sayisi && (
                      <div className="col-span-2 flex items-center gap-1 truncate">
                        <FileCheck size={9} className="text-slate-400 shrink-0" />
                        <span className="text-slate-400 font-semibold shrink-0">Talep:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                          {dosya.talep_sayisi} {dosya.talep_tarihi ? `· ${formatDate(dosya.talep_tarihi)}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Alt Bölüm: Maliyet + Tarih */}
                  <div className="px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={12} className="text-emerald-500" />
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                        ₺ {formatMoney(dosya.yaklasik_maliyet || 0)}
                      </span>
                      {dosya.kdv && (
                        <span className="text-[9px] text-emerald-500/70 font-semibold">(+%{dosya.kdv} KDV)</span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[9px] flex items-center gap-1">
                      <Calendar size={10} />
                      {dosya.dosya_acilis_tarihi ? formatDate(dosya.dosya_acilis_tarihi) : formatDate(dosya.created_at)}
                    </span>
                  </div>

                  {/* Seçili göstergesi */}
                  {activeDosyaId === dosya.id && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* TABLO GÖRÜNÜMÜ */
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 z-10">
                    <tr>
                      <th className="p-3.5 pl-5">Dosya No</th>
                      <th className="p-3.5">İhale Konusu (İşin Adı)</th>
                      <th className="p-3.5">Birim</th>
                      <th className="p-3.5">Tür</th>
                      <th className="p-3.5 text-right">Yaklaşık Maliyet</th>
                      <th className="p-3.5 text-center">Tarih</th>
                      <th className="p-3.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDosyalar.map((dosya) => (
                      <tr
                        key={dosya.id}
                        onClick={() => setActiveDosyaId(dosya.id)}
                        className={cn(
                          'hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors',
                          activeDosyaId === dosya.id && 'bg-blue-50/30 dark:bg-blue-900/10'
                        )}
                      >
                        <td className="p-3.5 pl-5 font-mono font-bold text-slate-500 whitespace-nowrap">
                          {dosya.temin_no || '-'}
                        </td>
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200 max-w-xs truncate" title={dosya.konu}>
                          {dosya.konu}
                          {dosya.tekrar_no && dosya.tekrar_no > 1 ? (
                            <span className="ml-1 text-[9px] text-amber-500 font-black">#{dosya.tekrar_no}</span>
                          ) : null}
                        </td>
                        <td className="p-3.5 text-slate-500 max-w-[120px] truncate text-[10px]">
                          {dosya.birim_adi || '-'}
                        </td>
                        <td className="p-3.5">
                          <TurBadge tur={dosya.tur} />
                        </td>
                        <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">
                          ₺ {formatMoney(dosya.yaklasik_maliyet || 0)}
                        </td>
                        <td className="p-3.5 text-center text-slate-450 whitespace-nowrap">
                          {dosya.dosya_acilis_tarihi ? formatDate(dosya.dosya_acilis_tarihi) : formatDate(dosya.created_at)}
                        </td>
                        <td className="p-3.5 text-right pr-5">
                          <ChevronRight size={16} className="text-slate-400" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* SAĞ TARAF: DETAY PANELİ */}
        <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col h-full">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col h-full shadow-sm overflow-hidden">
            {!selectedDosya ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800/80">
                  <FileText size={28} className="text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">Dosya Seçilmedi</h3>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1.5">
                  İşlem yapmak, detaylarını incelemek veya düzenlemek istediğiniz ihale dosyasını soldaki listeden seçin.
                </p>
              </div>
            ) : (
              <>
                {/* Detay Panel Başlığı */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                      AKTİF İHALE DOSYASI
                    </span>
                    <DurumBadge durumAsamaId={selectedDosya.durum_asama_id} />
                  </div>
                  <h2
                    className="text-sm font-bold text-slate-850 dark:text-white leading-snug line-clamp-3"
                    title={selectedDosya.konu}
                  >
                    {selectedDosya.konu}
                    {selectedDosya.tekrar_no && selectedDosya.tekrar_no > 1 ? (
                      <span className="ml-1.5 text-[10px] font-black text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                        #{selectedDosya.tekrar_no}
                      </span>
                    ) : null}
                  </h2>
                  {selectedDosya.temin_no && (
                    <span className="mt-1.5 inline-block text-[9px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {selectedDosya.temin_no}
                    </span>
                  )}
                </div>

                {/* Detay İçeriği */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">

                  {/* Birim */}
                  <div className="flex items-center gap-2 p-2.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                    <Building2 size={14} className="text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] text-blue-400 font-semibold uppercase tracking-wide">Birim / Müdürlük</p>
                      <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 truncate">
                        {selectedDosya.birim_adi || 'Birim Seçilmemiş'}
                      </p>
                    </div>
                  </div>

                  {/* Tür + Madde */}
                  <div className="grid grid-cols-2 gap-2">
                    <DetailField icon={<FileText size={11} />} label="Tür" value={
                      selectedDosya.tur === 'mal' ? 'Mal Alımı' :
                      selectedDosya.tur === 'hizmet' ? 'Hizmet Alımı' :
                      selectedDosya.tur === 'yapim_isi' ? 'Yapım İşi' : 'Danışmanlık'
                    } />
                    <DetailField icon={<BookOpen size={11} />} label="DT Maddesi" value={selectedDosya.ihale_sekli || '-'} />
                  </div>

                  {/* Maliyet */}
                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                    <p className="text-[9px] text-emerald-500 font-semibold uppercase tracking-wide mb-0.5">Yaklaşık Maliyet</p>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      ₺ {formatMoney(selectedDosya.yaklasik_maliyet || 0)}
                    </p>
                    {selectedDosya.kdv && (
                      <p className="text-[9px] text-emerald-500/70 font-semibold mt-0.5">
                        +%{selectedDosya.kdv} KDV dahil edilmemiş
                      </p>
                    )}
                  </div>

                  {/* Bütçe Bilgileri */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Bütçe & Muhasebe</p>
                    <div className="space-y-1">
                      <DetailRow label="Bütçe Tipi" value={selectedDosya.butce_tipi || '-'} />
                      <DetailRow label="Bütçe Yılı" value={selectedDosya.butce_yili?.toString() || '-'} />
                      {selectedDosya.butce_kodu && (
                        <DetailRow label="Bütçe Kodu" value={selectedDosya.butce_kodu} mono />
                      )}
                      {selectedDosya.ekonomik_kod && (
                        <DetailRow label="Ekonomik Kod" value={selectedDosya.ekonomik_kod} mono />
                      )}
                      {selectedDosya.kurumsal_kod && (
                        <DetailRow label="Kurumsal Kod" value={selectedDosya.kurumsal_kod} mono />
                      )}
                    </div>
                  </div>

                  {/* İhale Bilgileri */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">İhale & Sözleşme</p>
                    <div className="space-y-1">
                      <DetailRow label="Sözleşme Türü" value={selectedDosya.teklif_sozlesme_turu || '-'} />
                      {selectedDosya.talep_sayisi && (
                        <DetailRow label="Talep Sayısı" value={selectedDosya.talep_sayisi} />
                      )}
                      {selectedDosya.talep_tarihi && (
                        <DetailRow label="Talep Tarihi" value={formatDate(selectedDosya.talep_tarihi)} />
                      )}
                      {selectedDosya.son_teklif_verme_tarihi && (
                        <DetailRow label="Son Teklif Tarihi" value={
                          new Date(selectedDosya.son_teklif_verme_tarihi).toLocaleString('tr-TR')
                        } />
                      )}
                      {selectedDosya.teslim_tarihi && (
                        <DetailRow label="Teslim Tarihi" value={formatDate(selectedDosya.teslim_tarihi)} />
                      )}
                    </div>
                  </div>

                  {/* İşin Tanımı */}
                  {selectedDosya.isin_aciklamasi && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">İşin Tanımı / Kapsamı</p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-350 leading-relaxed line-clamp-4">
                        {selectedDosya.isin_aciklamasi}
                      </p>
                    </div>
                  )}

                  {/* Notlar */}
                  {selectedDosya.notlar && (
                    <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                      <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <AlertCircle size={10} /> Notlar
                      </p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
                        {selectedDosya.notlar}
                      </p>
                    </div>
                  )}
                </div>

                {/* Aksiyon Butonları */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate({ to: `/dosyalar/yeni?id=${selectedDosya.id}` })}
                      className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit size={14} />
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(selectedDosya.id)}
                      className="px-4 py-2.5 border border-red-200 dark:border-red-950/20 hover:bg-red-50 dark:hover:bg-red-955/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Sil
                    </button>
                  </div>

                  {!isWindowMode && (
                    <button
                      onClick={handleOpenInNewWindow}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink size={14} />
                      Yeni Pencerede Aç
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- Yardımcı bileşenler ---- */
function DetailField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-2 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl">
      <div className="flex items-center gap-1 text-slate-400 mb-0.5">
        {icon}
        <span className="text-[9px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{value}</p>
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-850/80 last:border-0">
      <span className="text-[10px] text-slate-500 dark:text-slate-450 font-medium shrink-0 mr-2">{label}:</span>
      <span className={cn('text-[10px] font-bold text-slate-700 dark:text-slate-300 text-right truncate max-w-[180px]', mono && 'font-mono')}>
        {value}
      </span>
    </div>
  )
}
