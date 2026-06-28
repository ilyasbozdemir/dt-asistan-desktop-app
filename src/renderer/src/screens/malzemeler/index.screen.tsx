import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  PackageSearch,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Tag,
  Search,
  ListFilter,
  FolderTree,
  Download,
  Upload
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useMalzemelerHooks } from './malzemeler.hooks'
import { cn } from '../../utils/cn'

export default function MalzemelerScreen(): React.JSX.Element {
  const { kalemList, isLoading: isKalemLoading, deleteKalem } = useMalzemelerHooks()

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('Tümü') // Tümü, Mal, Hizmet, Personel, Hizmet, Diğer, Yapım

  const handleDelete = async (id: number) => {
    if (confirm('Bu malzeme/hizmet kaydını silmek istediğinize emin misiniz?')) {
      try {
        await deleteKalem(id)
      } catch (error: any) {
        alert('Silinirken hata oluştu: ' + error.message)
      }
    }
  }

  const handleImport = async () => {
    if (
      !window.confirm(
        'ÖNERİ: Ürünlerin ID ve Barkod çakışması yaşamaması için, manuel malzeme girişlerinden ÖNCE Excel aktarımını yapmanız tavsiye edilir.\n\nExcel\'deki "Barkod_ID" mevcut ise mevcut kayıtlar güncellenir, yoksa yeni olarak eklenir.\n\nAktarıma devam edilsin mi?'
      )
    ) {
      return
    }

    try {
      const res = await window.electron.ipcRenderer.invoke('db:import-kalem-excel')
      if (res.success) {
        alert(`İçe aktarma başarılı. ${res.count} kalem güncellendi/eklendi.`)
        window.location.reload()
      } else if (res.error !== 'İptal edildi') {
        alert('İçe aktarma hatası: ' + res.error)
      }
    } catch (e: any) {
      alert('Hata: ' + e.message)
    }
  }

  const handleExportTemplate = async () => {
    try {
      const res = await window.electron.ipcRenderer.invoke('db:export-kalem-template')
      if (res.error && res.error !== 'İptal edildi') {
        alert('Şablon kaydetme hatası: ' + res.error)
      }
    } catch (e: any) {
      alert('Hata: ' + e.message)
    }
  }

  const filteredList = kalemList.filter((m) => {
    const matchesSearch =
      m.kalem_adi.toLowerCase().includes(search.toLowerCase()) ||
      (m.tasinir_kodu || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.okas_kodu || '').toLowerCase().includes(search.toLowerCase()) ||
      m.barkod_id.toLowerCase().includes(search.toLowerCase())

    const matchesTab =
      activeTab === 'Tümü' ||
      m.tipi === activeTab ||
      (activeTab === 'Hizmet' && m.tipi?.startsWith('Hizmet'))

    return matchesSearch && matchesTab
  })

  if (isKalemLoading) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex flex-col gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="w-full">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <PackageSearch className="w-8 h-8 text-blue-605" />
            Kayıtlı Mal / Hizmet / Yapım İşleri Listesi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-4xl">
            Yaklaşık maliyet hesaplarında ve teklif mektuplarında kullanılacak malzeme, hizmet ve
            yapım kalemlerini yönetin.
          </p>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <p className="mb-1">
                💡 <strong>İpucu:</strong> Güncel Taşınır Kodları listesine ulaşmak için{' '}
                <a
                  href="https://muhasebat.hmb.gov.tr/tasinir-kod-listesi"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-semibold hover:text-blue-800 dark:hover:text-blue-200"
                >
                  Muhasebat Genel Müdürlüğü
                </a>{' '}
                sayfasını ziyaret edebilirsiniz.
              </p>
              <p>
                📣 Uygulama altyapımız bu kodları tamamen desteklemektedir. Hazır malzeme listesi ve
                kodlarının varsayılan olarak eklenmesi için{' '}
                <a
                  href="https://github.com/ilyasbozdemir/dt-asistan-desktop-app"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-semibold hover:text-blue-800 dark:hover:text-blue-200"
                >
                  GitHub sayfamızdan Issue açarak
                </a>{' '}
                bize veritabanı taleplerinizi iletebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 w-full bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 pb-4 sm:pb-0 pr-0 sm:pr-6 w-full sm:w-auto">
            <div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 leading-none">
                {kalemList.length}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                Kayıtlı Kalem
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1 justify-end w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleExportTemplate}
              className="gap-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center px-4 py-2 text-sm justify-center"
              title="Örnek şablonu indir"
            >
              <Download className="w-4 h-4 text-blue-600 shrink-0" />{' '}
              <span className="whitespace-nowrap">Şablon İndir</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleImport}
              className="gap-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center px-4 py-2 text-sm justify-center"
              title="Excel'den toplu kalem yükle"
            >
              <Upload className="w-4 h-4 text-orange-600 shrink-0" />{' '}
              <span className="whitespace-nowrap">Excel İçe Aktar</span>
            </Button>
            <Link to="/tasinirkod" className="shrink-0">
              <Button
                variant="outline"
                className="w-full gap-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center px-4 py-2 text-sm justify-center"
              >
                <FolderTree className="w-4 h-4 text-emerald-600 shrink-0" />{' '}
                <span className="whitespace-nowrap">Taşınır Kodları</span>
              </Button>
            </Link>
            <Link to="/okaskod" className="shrink-0">
              <Button
                variant="outline"
                className="w-full gap-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center px-4 py-2 text-sm justify-center"
              >
                <Tag className="w-4 h-4 text-indigo-600 shrink-0" />{' '}
                <span className="whitespace-nowrap">OKAS Kodları</span>
              </Button>
            </Link>
            <Link to="/malzemeler/yeni" className="shrink-0">
              <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 shadow-md flex items-center px-5 py-2 text-sm justify-center text-white">
                <Plus className="w-4 h-4 shrink-0" />{' '}
                <span className="whitespace-nowrap font-semibold">Mal/Hizmet/Yapım İşi Ekle</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-450 flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Mal Alımı (Malzeme)
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {kalemList.filter((m) => m.tipi === 'Mal').length} Kalem
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Hizmet Alımı
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {kalemList.filter((m) => m.tipi?.startsWith('Hizmet')).length} Kalem
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-450 flex items-center justify-center shrink-0">
            <PackageSearch className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Yapım İşi
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {kalemList.filter((m) => m.tipi === 'Yapım').length} Kalem
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden">
        {/* TABS & SEARCH */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg overflow-x-auto max-w-full">
            {['Tümü', 'Mal', 'Hizmet', 'Yapım'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap',
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                {tab === 'Mal'
                  ? 'Mal Alımı'
                  : tab === 'Hizmet'
                    ? 'Hizmet Alımı'
                    : tab === 'Yapım'
                      ? 'Yapım İşi'
                      : tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ad, Barkod veya Taşınır Kodu ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredList.length === 0 ? (
              <div className="col-span-full p-16 flex flex-col items-center justify-center text-slate-450 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <ListFilter className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
                <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  Kayıt Bulunamadı
                </h3>
                <p className="text-xs mt-1 text-slate-500">
                  Arama veya filtreleme kriterlerine uygun kayıt bulunmuyor.
                </p>
              </div>
            ) : (
              filteredList.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors group relative"
                >
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-blue-500"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      title="Sil"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1 mb-2 pr-12">
                    <span className="font-mono font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      ID: {item.barkod_id}
                    </span>
                    {item.tasinir_kodu && (
                      <span className="w-fit font-mono font-bold text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100/20 dark:border-emerald-900/10 px-1.5 py-0.5 rounded">
                        T: {item.tasinir_kodu}
                      </span>
                    )}
                    {item.okas_kodu && (
                      <span className="w-fit font-mono font-bold text-[10px] text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100/20 dark:border-indigo-900/10 px-1.5 py-0.5 rounded">
                        OKAS: {item.okas_kodu}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 leading-snug line-clamp-3">
                    {item.kalem_adi}
                  </h4>

                  <div className="mt-auto border-t border-slate-200/60 dark:border-slate-800/60 pt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {item.tipi}
                    </span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Birim: {item.birim}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
