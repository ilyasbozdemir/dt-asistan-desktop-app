import React, { useState } from 'react'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { Package, Printer, AlertCircle } from 'lucide-react'
import { SubScreen } from '../SubScreens.screen'
import { useCiktiMerkeziData } from '../CiktiMerkezi.hooks'
import Mustache from 'mustache'

import { useMalzemeListesi } from './components/MalzemeListesi/useMalzemeListesi'
import { MalzemeEkleModal } from './components/MalzemeListesi/MalzemeEkleModal'
import { MalzemeTablosu } from './components/MalzemeListesi/MalzemeTablosu'

export function MalzemeListesi(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const { sablons, loading: ciktiLoading, masterHtml, dosyaContext } = useCiktiMerkeziData(activeDosyaId)
  const [isPrinting, setIsPrinting] = useState(false)
  
  const state = useMalzemeListesi(activeDosyaId)

  const handlePrintTemplate = async () => {
    try {
      setIsPrinting(true)
      const settingsRes = await (window as any).electron.ipcRenderer.invoke('db:get-settings')
      const sablonIdStr = settingsRes ? settingsRes['MAPPING_IHTIYAC_LISTESI_SABLON_ID'] : null
      
      if (!sablonIdStr) {
        alert("Lütfen Şablon & Kategori Yönetimi bölümünden İhtiyaç Listesi için bir şablon bağlayınız.")
        return
      }

      const selectedSablon = sablons.find(s => s.id.toString() === sablonIdStr)
      if (!selectedSablon) {
        alert("Bağlı şablon bulunamadı veya silinmiş. Lütfen Şablon & Kategori Yönetimi bölümünden kontrol ediniz.")
        return
      }

      if (!masterHtml) {
        alert("Master şablon yüklenemedi, veriler bekleniyor.")
        return
      }

      // Context ile override verilerini birleştir
      let finalContext = { ...dosyaContext }
      if (settingsRes['MAPPING_IHTIYAC_LISTESI_JSON_OVERRIDE']) {
         try {
            const overrideData = JSON.parse(settingsRes['MAPPING_IHTIYAC_LISTESI_JSON_OVERRIDE'])
            finalContext = { ...finalContext, ...overrideData }
         } catch (e) {
            console.error('JSON Override parse hatası:', e)
         }
      }

      // İhtiyaç listesi şablonunu context ile işle
      const renderedContent = Mustache.render(selectedSablon.icerik, finalContext)
      // İşlenmiş şablonu master HTML içerisine göm
      const finalHtml = Mustache.render(masterHtml, finalContext, { content: renderedContent })

      await (window as any).electron.ipcRenderer.invoke('print-html', finalHtml, { silent: false })
    } catch (error: any) {
      alert("Yazdırma sırasında bir hata oluştu: " + error.message)
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <SubScreen
      title="Malzeme / Hizmet Kalem Listesi"
      icon={Package}
      description="Dosya kapsamındaki malzeme, hizmet veya yapım işi ihtiyaçlarını listeleyin ve yönetin."
    >
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={handlePrintTemplate}
          disabled={isPrinting || ciktiLoading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
        >
          {isPrinting ? <AlertCircle className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
          Yazdır / PDF Olarak Kaydet
        </button>
      </div>

      <MalzemeEkleModal state={state} />
      <MalzemeTablosu state={state} />

    </SubScreen>
  )
}
