import React, { useState, useEffect, useMemo } from 'react'
import { SubScreen } from './SubScreens.screen'
import { Printer, Download, FileText, CheckSquare, Square, Layers, Loader2 } from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import Mustache from 'mustache'
import { Sablon } from '../sablonlar/sablonlar.hooks'
import { SAYI_YAZI_MAP, sayiyiYaziyaCevir } from '../../constants/sayiEslesmeleri'
import { getInstitutionSuffixes } from '../../utils/kurumHelper'

export function CiktiMerkeziScreen(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const [sablons, setSablons] = useState<Sablon[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [masterHtml, setMasterHtml] = useState('')
  const [dosyaContext, setDosyaContext] = useState<any>({})

  // Veritabanından şablonları ve aktif dosya verisini çek
  useEffect(() => {
    if (!activeDosyaId) return

    const loadData = async () => {
      setLoading(true)
      try {
        // Master HTML'i al
        const mHtml = await window.electron.ipcRenderer.invoke('template:read-system', 'master.html')
        if (typeof mHtml === 'string') setMasterHtml(mHtml)

        // Şablonları al (sadece en güncel versiyonlar)
        const sablonsRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Sablon WHERE id IN (SELECT MAX(id) FROM TANIM_Sablon WHERE aktif_mi = 1 GROUP BY COALESCE(parent_id, id)) ORDER BY kategori ASC, ad ASC'
        )
        if (sablonsRes.success) setSablons(sablonsRes.data)

        // Aktif dosya verisini al (Temel dosya bilgisi, onaylayan personel ve kalemler)
        const dosyaRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT d.*, p.ad_soyad as onaylayan_ad_soyad, p.unvan as onaylayan_unvan 
           FROM DATA_TeminDosyasi d 
           LEFT JOIN TANIM_Personel p ON d.onay_personel_id = p.id 
           WHERE d.id = ?`,
          [activeDosyaId]
        )
        const kalemlerRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
          [activeDosyaId]
        )

        // Firmaları çek (DATA_TeminFirma ve TANIM_Firma birleşimi)
        const firmsRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT df.id as temin_firma_id, f.unvan, f.id as firma_id 
           FROM DATA_TeminFirma df 
           JOIN TANIM_Firma f ON df.firma_id = f.id 
           WHERE df.temin_dosya_id = ?`,
          [activeDosyaId]
        )
        const firms = firmsRes.success ? firmsRes.data : []

        // Teklifleri çek
        const bidsRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?',
          [activeDosyaId]
        )
        const bids = bidsRes.success ? bidsRes.data : []
        const bidsMap: Record<string, number> = {}
        bids.forEach((b: any) => {
          bidsMap[`${b.temin_kalem_id}_${b.temin_firma_id}`] = b.birim_fiyat || 0
        })

        // Komisyon üyelerini çek
        const komsRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT tk.*, p.ad_soyad, p.unvan 
           FROM DATA_TeminKomisyon tk 
           JOIN TANIM_Personel p ON tk.personel_id = p.id 
           WHERE tk.temin_dosya_id = ? AND tk.komisyon_turu = 'Fiyat Araştırma'`,
          [activeDosyaId]
        )
        const commission = komsRes.success ? komsRes.data : []

        const settings = await window.electron.ipcRenderer.invoke('db:get-settings')
        const subInstType = settings?.subInstitutionType || ''
        
        const suffixes = getInstitutionSuffixes(subInstType, {
          label: settings?.customSubInstitutionLabel,
          kurumumuz: settings?.customSubInstitutionKurumumuz,
          kurumunuz: settings?.customSubInstitutionKurumunuz,
          kurumu: settings?.customSubInstitutionKurumu,
          kurumlari: settings?.customSubInstitutionKurumlari
        })

        const today = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

        const kalemSayisi = kalemlerRes.data?.length || 0
        const kalemSayisiYazi = sayiyiYaziyaCevir(kalemSayisi)

        // Para birimi formatlayıcı
        const formatTR = (val: number) => {
          return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)
        }

        // Firma toplamlarını hesapla
        const firmaToplamlari = firms.map((f: any) => {
          let sum = 0
          kalemlerRes.data?.forEach((k: any) => {
            const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
            sum += price * (k.miktar || 0)
          })
          return {
            toplam: formatTR(sum)
          }
        })

        // En düşük fiyatlar ve genel toplam hesaplama
        let grandTotal = 0
        const needItems = kalemlerRes.data?.map((k: any, index: number) => {
          const itemPrices = firms.map((f: any) => ({
            unvan: f.unvan,
            price: bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
          }))
          const validPrices = itemPrices.filter((p: any) => p.price > 0)
          const minPrice = validPrices.length > 0 ? Math.min(...validPrices.map((p: any) => p.price)) : 0
          const toplamBedel = minPrice * (k.miktar || 0)
          grandTotal += toplamBedel

          const enUygunFirma = validPrices.length > 0 ? validPrices.reduce((prev: any, curr: any) => prev.price < curr.price ? prev : curr) : null
          const enUygunFirmaAdi = enUygunFirma ? enUygunFirma.unvan : 'Teklif Yok'

          const firmaTeklifleri = firms.map((f: any) => {
            const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
            return {
              fiyat: price > 0 ? formatTR(price) : '-'
            }
          })

          const firmaTeklifleriDetay = firms.map((f: any) => {
            const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
            const total = price * (k.miktar || 0)
            return {
              birimFiyat: price > 0 ? formatTR(price) : '-',
              tutar: total > 0 ? formatTR(total) : '-',
              hasPrice: price > 0
            }
          })

          return {
            siraNo: index + 1,
            kodu: k.tasinir_kodu || k.okas_kodu || '-',
            malzemeAdi: k.kalem_adi,
            ozelligi: k.aciklama || '',
            birimi: k.birim,
            kdvOrani: `%${k.kdv_orani}`,
            miktar: formatTR(k.miktar || 0),
            firmaTeklifleri,
            firmaTeklifleriDetay,
            enUygunFirmaAdi,
            enDusukFiyat: minPrice > 0 ? formatTR(minPrice) : '-',
            toplamBedel: toplamBedel > 0 ? formatTR(toplamBedel) : '-'
          }
        }) || []

        const genelToplam = formatTR(grandTotal)

        let context: any = {
          tarih: today,
          dosyaTarihi: dosyaRes.data?.[0]?.tarih || today,
          kurumIci: false,
          evrakSayisi: dosyaRes.data?.[0]?.temin_no || 'Belirtilmedi',
          dosyaKonusu: dosyaRes.data?.[0]?.konu || 'Konu Belirtilmedi',
          isAdi: dosyaRes.data?.[0]?.konu || 'Konu Belirtilmedi',
          sayiYazıyla: SAYI_YAZI_MAP,
          kurumumuz: suffixes.kurumumuz,
          kurumunuz: suffixes.kurumunuz,
          kurumu: suffixes.kurumu,
          kurumlari: suffixes.kurumlari,
          kalemSayisi,
          kalemSayisiYazi,
          baskanAdi: dosyaRes.data?.[0]?.onaylayan_ad_soyad || 'Harcama Yetkilisi Belirtilmedi',
          baskanUnvan: dosyaRes.data?.[0]?.onaylayan_unvan || 'Harcama Yetkilisi',
          komisyon: commission.map((c: any) => ({
            adSoyad: c.ad_soyad,
            unvan: c.unvan,
            gorevi: c.gorevi
          })),
          firmalar: firms.map((f: any) => ({ unvan: f.unvan })),
          firmalarColspan: firms.length + 2,
          firmaToplamlari,
          firmaToplamlariDetay: firmaToplamlari,
          genelToplam,
          ihtiyacKalemleri: needItems
        }

        // Varsa test/master dummy verisini de alıp birleştir, gerçek veriler üzerine yazsın
        const mJson = await window.electron.ipcRenderer.invoke('template:read-system', 'master.html.json')
        if (typeof mJson === 'string') {
          try {
            const parsedJson = JSON.parse(mJson)
            context = { ...parsedJson, ...context }
          } catch (e) {}
        }
        
        setDosyaContext(context)
      } catch (error) {
        console.error('Veri yüklenirken hata:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [activeDosyaId])

  const groupedSablons = useMemo(() => {
    const groups: Record<string, Sablon[]> = {}
    sablons.forEach(s => {
      const cat = s.kategori || 'Diğer'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(s)
    })
    return groups
  }, [sablons])

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleGroup = (cat: string) => {
    const groupIds = groupedSablons[cat].map(s => s.id)
    const allSelected = groupIds.every(id => selectedIds.has(id))
    const newSet = new Set(selectedIds)
    
    if (allSelected) {
      groupIds.forEach(id => newSet.delete(id))
    } else {
      groupIds.forEach(id => newSet.add(id))
    }
    setSelectedIds(newSet)
  }

  const renderHtml = (sablon: Sablon) => {
    try {
      if (!masterHtml) return sablon.icerik
      return Mustache.render(masterHtml, dosyaContext, { content: sablon.icerik })
    } catch (error) {
      console.error('Template render hatası:', error)
      return sablon.icerik
    }
  }

  const handleAction = async (action: 'pdf' | 'udf' | 'docx' | 'print') => {
    if (selectedIds.size === 0) {
      alert('Lütfen en az bir belge seçin.')
      return
    }

    setProcessing(true)
    try {
      const selectedSablons = sablons.filter(s => selectedIds.has(s.id))

      for (const sablon of selectedSablons) {
        const html = renderHtml(sablon)
        const safeName = sablon.ad.replace(/[^a-z0-9]/gi, '_').toLowerCase()

        if (action === 'pdf') {
          await window.electron.ipcRenderer.invoke('export-pdf', html, null, `${safeName}_${activeDosyaId}`)
        } else if (action === 'udf') {
          await window.electron.ipcRenderer.invoke('export-udf', html, `${safeName}_${activeDosyaId}`)
        } else if (action === 'docx') {
          await window.electron.ipcRenderer.invoke('export-docx', html, `${safeName}_${activeDosyaId}`)
        } else if (action === 'print') {
          await window.electron.ipcRenderer.invoke('print-html', html, { silent: true }) // Silent true for batch printing
        }
      }

      if (action === 'print') {
        alert('Belgeler başarıyla yazdırma kuyruğuna gönderildi.')
      }
    } catch (error: any) {
      alert(`İşlem sırasında hata oluştu: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <SubScreen
      title="Çıktı & Yazdırma Merkezi"
      icon={Printer}
      description="Aktif dosyaya ait belgeleri tek tıkla ODF/UDF/PDF formatında indirebilir veya sırayla yazdırabilirsiniz."
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row min-h-[500px] mt-4 overflow-hidden">
        
        {/* SOL: BELGE LİSTESİ */}
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              Dosya Belgeleri
            </h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400 font-semibold">
              {selectedIds.size} Seçili
            </span>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
              {Object.entries(groupedSablons).map(([kategori, items]) => (
                <div key={kategori} className="space-y-2">
                  <div 
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => toggleGroup(kategori)}
                  >
                    {items.every(i => selectedIds.has(i.id)) ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{kategori}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                    {items.map(sablon => (
                      <div 
                        key={sablon.id}
                        onClick={() => toggleSelect(sablon.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedIds.has(sablon.id)
                            ? 'bg-blue-50/50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-300'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="shrink-0">
                          {selectedIds.has(sablon.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate" title={sablon.ad}>{sablon.ad}</p>
                          <p className="text-[10px] text-slate-500 truncate" title={sablon.dosya_adi}>{sablon.dosya_adi}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SAĞ: İŞLEM MENÜSÜ */}
        <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/50 p-6 flex flex-col gap-4">
          <div className="mb-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Toplu İşlemler</h3>
            <p className="text-[11px] text-slate-500">Seçtiğiniz {selectedIds.size} belge için uygulamak istediğiniz işlemi seçin.</p>
          </div>

          <button
            onClick={() => handleAction('print')}
            disabled={processing || selectedIds.size === 0}
            className="w-full flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <Printer className="w-5 h-5 text-slate-300" />
            <div className="text-left flex-1">
              <div className="text-sm font-bold">Sırayla Yazdır</div>
              <div className="text-[10px] text-slate-400">Varsayılan yazıcıya gönderilir</div>
            </div>
          </button>

          <div className="h-px bg-slate-200 dark:bg-slate-800 my-2"></div>

          <button
            onClick={() => handleAction('pdf')}
            disabled={processing || selectedIds.size === 0}
            className="w-full flex items-center gap-3 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">PDF Olarak İndir</div>
              <div className="text-[9px] text-slate-500">Orijinal sayfa yapısıyla</div>
            </div>
          </button>

          <button
            onClick={() => handleAction('docx')}
            disabled={processing || selectedIds.size === 0}
            className="w-full flex items-center gap-3 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">ODF / DOCX İndir</div>
              <div className="text-[9px] text-slate-500">Düzenlenebilir ofis belgesi</div>
            </div>
          </button>

          <button
            onClick={() => handleAction('udf')}
            disabled={processing || selectedIds.size === 0}
            className="w-full flex items-center gap-3 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-900 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">UDF İndir</div>
              <div className="text-[9px] text-slate-500">UYAP formatında (Salt metin)</div>
            </div>
          </button>

        </div>
      </div>
    </SubScreen>
  )
}
