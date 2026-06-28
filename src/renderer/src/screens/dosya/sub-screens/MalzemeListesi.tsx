import React, { useState } from 'react'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { FileText, Package, Printer } from 'lucide-react'
import { SubScreen } from '../SubScreens.screen'
import { useCiktiMerkeziData } from '../CiktiMerkezi.hooks'

import { useMalzemeListesi } from './components/MalzemeListesi/useMalzemeListesi'
import { MalzemeEkleModal } from './components/MalzemeListesi/MalzemeEkleModal'
import { MalzemeTablosu } from './components/MalzemeListesi/MalzemeTablosu'
import { DocumentPreviewModal } from '../components/DocumentPreviewModal'

export function MalzemeListesi(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const {
    sablons,
    loading: ciktiLoading,
    masterHtml,
    dosyaContext,
    placeholders
  } = useCiktiMerkeziData(activeDosyaId)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewData, setPreviewData] = useState<{
    title: string
    templateHtml: string
    processPath: string
    templateTestVerisi?: string
  } | null>(null)

  const state = useMalzemeListesi(activeDosyaId)

  const handleOpenPreview = async (processPath: string, title: string) => {
    try {
      const settingsRes = await (window as any).electron.ipcRenderer.invoke('db:get-settings')
      const sablonIdStr = settingsRes ? settingsRes[`MAPPING_${processPath}_SABLON_ID`] : null

      if (!sablonIdStr) {
        alert(`Lütfen Şablon & Kategori Yönetimi bölümünden '${title}' için bir şablon bağlayınız.`)
        return
      }

      const selectedSablon = sablons.find((s) => s.id.toString() === sablonIdStr)
      if (!selectedSablon) {
        alert(
          'Bağlı şablon bulunamadı veya silinmiş. Lütfen Şablon & Kategori Yönetimi bölümünden kontrol ediniz.'
        )
        return
      }

      if (!masterHtml) {
        alert('Master şablon yüklenemedi, veriler bekleniyor.')
        return
      }

      setPreviewData({
        title,
        templateHtml: selectedSablon.icerik,
        processPath,
        templateTestVerisi: selectedSablon.test_verisi || ''
      })
      setPreviewModalOpen(true)
    } catch (error: any) {
      alert('Önizleme yüklenirken bir hata oluştu: ' + error.message)
    }
  }

  const executePrint = async (html: string) => {
    await (window as any).electron.ipcRenderer.invoke('print-html', html, { silent: false })
  }

  const executeExportPdf = async (html: string) => {
    await (window as any).electron.ipcRenderer.invoke(
      'export-pdf',
      html,
      null,
      previewData?.title || 'Belge'
    )
  }

  if (previewData && previewModalOpen) {
    return (
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewData.title}
        templateHtml={previewData.templateHtml}
        masterHtml={masterHtml || ''}
        baseContext={dosyaContext}
        placeholders={placeholders}
        onPrint={executePrint}
        onExportPdf={executeExportPdf}
        isInline={true}
        templateTestVerisi={previewData.templateTestVerisi}
      />
    )
  }

  return (
    <SubScreen
      title="İhtiyaç Listesi"
      icon={Package}
      description="Dosya kapsamındaki malzeme, hizmet veya yapım işi ihtiyaçlarını listeleyin ve yönetin."
    >
      <div className="flex flex-col items-end mb-4 print:hidden">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
          DOSYAYA EKLENEN İHTİYAÇ MALZEMELERİ
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenPreview('/dosya/malzemeler/liste', 'Son Alım Fiyat Cetveli')}
            disabled={ciktiLoading}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            Son Alım Fiyat Cetveli
          </button>
          <button
            onClick={() => handleOpenPreview('/dosya/luzum/talep-formu', 'İhtiyaç Talep Formu')}
            disabled={ciktiLoading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            İhtiyaç Talep Formu
          </button>
          <button
            onClick={() => handleOpenPreview('/dosya/malzemeler/liste', 'İhtiyaç Listesi')}
            disabled={ciktiLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            İhtiyaç Listesi
          </button>
        </div>
      </div>

      <MalzemeEkleModal state={state} />
      <MalzemeTablosu state={state} />
    </SubScreen>
  )
}
