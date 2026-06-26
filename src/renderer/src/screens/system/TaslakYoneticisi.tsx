import React, { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Star,
  FileText,
  Search,
  Plus,
  ArrowRight,
  Trash2,
  FolderOpen
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useWorkspaceStore } from '../../store/workspaceStore'

const ROUTE_MAP: Record<string, string> = {
  "Fiyat Araştırma Komisyonu Atama": "/dosya/komisyon/fiyat-arastirma",
  "Muayene Kabul Komisyonu Atama": "/dosya/komisyon/muayene-kabul",
  "Fiyat Araştırma ve Muayene Komisyonu": "/dosya/komisyon/fiyat-muayene",
  "Komisyon Atama Onay Eki": "/dosya/komisyon/onay-eki",
  "Malzeme / Hizmet Kalem Listesi": "/dosya/malzemeler/liste",
  "Lüzum Müzekkeresi Belgesi": "/dosya/luzum/belge",
  "Lüzum Onay Eki": "/dosya/luzum/onay-eki",
  "Teslim Tesellüm Belgesi": "/dosya/luzum/teslim-tesellum",
  "İstekli Tedarikçi Firmalar": "/dosya/firmalar-maliyet/istekliler",
  "Yaklaşık Maliyet Hesap Cetveli": "/dosya/firmalar-maliyet/yaklasik",
  "Piyasa Fiyat Araştırma Tutanağı": "/dosya/firmalar-maliyet/tutanak",
  "Doğrudan Temin Onay Belgesi": "/dosya/onay/dt-onay",
  "İhale Onay Belgesi": "/dosya/onay/ihale-onay",
  "Bütçe Sorgusu": "/dosya/onay/butce-sorgu",
  "Harcama Talimatı": "/dosya/harcama/talimat",
  "Harcama Pusulası": "/dosya/harcama/pusula"
}

export default function TaslakYoneticisi(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'kisayollar' | 'taslaklar'>('kisayollar')
  const { setActiveDosyaId } = useWorkspaceStore()
  const navigate = useNavigate()

  // Dosyalardaki kısayolları bulalım
  const { data: dosyalar = [], isLoading: dosyalarLoading } = useQuery({
    queryKey: ['dosyalar_kisayollar'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id, temin_no, konu, starred_docs FROM DATA_TeminDosyasi WHERE starred_docs IS NOT NULL AND starred_docs != "[]"'
      )
      if (!res.success) return []
      return res.data.map((d: any) => ({
        ...d,
        starred: JSON.parse(d.starred_docs || '[]')
      }))
    }
  })

  // Süreç Taslaklarını bulalım
  const { data: taslaklar = [], isLoading: taslaklarLoading } = useQuery({
    queryKey: ['surec_taslaklar'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_SurecTaslak WHERE aktif_mi = 1'
      )
      if (!res.success) return []
      return res.data
    }
  })

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            Kısayol & Taslak Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-2xl">
            Aktif dosyalarınızda yıldızladığınız evrakları hızlı erişimde görün ve sık kullandığınız belge üretim sıralarını "Taslak" olarak kaydedin.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('kisayollar')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'kisayollar'
              ? 'border-amber-500 text-amber-600 dark:text-amber-500'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Aktif Dosya Kısayolları
        </button>
        <button
          onClick={() => setActiveTab('taslaklar')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'taslaklar'
              ? 'border-blue-500 text-blue-600 dark:text-blue-500'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Kayıtlı İşlem Taslakları
        </button>
      </div>

      {activeTab === 'kisayollar' && (
        <div className="space-y-4">
          {dosyalarLoading ? (
            <div className="text-center py-8 text-slate-500">Yükleniyor...</div>
          ) : dosyalar.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
              <Star className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Henüz Kısayol Yok</h3>
              <p className="text-slate-500 text-sm">
                Aktif dosyalarınızda çalışırken evrakları "Hızlı Erişime Ekle" butonu ile yıldızlayabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dosyalar.map((dosya: any) => (
                <div key={dosya.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{dosya.konu}</div>
                        <div className="text-[10px] text-slate-500">{dosya.temin_no}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    {dosya.starred.map((doc: string, idx: number) => {
                      const route = ROUTE_MAP[doc] || '/dosya/cikti-merkezi'
                      return (
                      <Link 
                        key={idx} 
                        to={route} 
                        onClick={() => {
                          window.electron.ipcRenderer.invoke('store:set', 'activeDosyaId', dosya.id)
                          setActiveDosyaId(dosya.id)
                        }}
                        className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer dark:bg-amber-900/10 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-500 p-2 rounded-lg text-xs font-bold border border-amber-100 dark:border-amber-900/30"
                      >
                        <Star className="w-3 h-3 fill-amber-500" />
                        {doc}
                      </Link>
                    )})}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
                    <Link to="/" search={{ mode: 'dosya_window' }} onClick={() => window.electron.ipcRenderer.invoke('store:set', 'activeDosyaId', dosya.id)} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-end gap-1">
                      Dosyaya Git <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'taslaklar' && (
        <div className="space-y-4">
          <div className="flex justify-end">
             <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
               <Plus className="w-4 h-4" /> Yeni Taslak
             </button>
          </div>
          {taslaklarLoading ? (
             <div className="text-center py-8 text-slate-500">Yükleniyor...</div>
          ) : taslaklar.length === 0 ? (
             <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Taslak Bulunmuyor</h3>
              <p className="text-slate-500 text-sm">
                Sık kullandığınız üretim listelerini buraya taslak olarak kaydedebilirsiniz.
              </p>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taslaklar.map((taslak: any) => {
                  const orderedDocs: string[] = JSON.parse(taslak.ordered_docs || '[]')
                  return (
                  <div key={taslak.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{taslak.taslak_adi}</div>
                          <div className="text-[10px] text-slate-500">{taslak.tur}</div>
                        </div>
                      </div>
                      <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer" title="Taslağı Sil">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                      {orderedDocs.map((doc, idx) => {
                        const route = ROUTE_MAP[doc] || '/dosya/cikti-merkezi'
                        return (
                          <Link
                            key={idx}
                            to={route}
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer dark:bg-blue-900/10 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-500 p-2 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-900/30"
                          >
                            <span className="w-4 text-center font-black opacity-50">{idx + 1}.</span>
                            {doc}
                          </Link>
                        )
                      })}
                      {orderedDocs.length === 0 && (
                        <div className="text-xs text-slate-400 italic">Bu taslakta henüz belge yok.</div>
                      )}
                    </div>
                  </div>
                )})}
             </div>
          )}
        </div>
      )}
    </div>
  )
}
