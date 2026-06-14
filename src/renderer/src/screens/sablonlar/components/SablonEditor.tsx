import React, { useState, useRef, useEffect, useMemo } from 'react'

import Mustache from 'mustache'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'
import {
  FileText,
  Upload,
  Download,
  Save,
  GripVertical,
  Database,
  ArrowLeft,
  LayoutTemplate,
  Eye
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Sablon, useSaveSablon, usePlaceholders } from '../sablonlar.hooks'
import { A4Editor } from '../../../components/editor/A4Editor'

const ResizeHandle = () => (
  <PanelResizeHandle className="w-2 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 transition-colors cursor-col-resize group">
    <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
  </PanelResizeHandle>
)

export function SablonEditor({ sablon, onBack }: { sablon?: Sablon, onBack: () => void }) {
  const [ad, setAd] = useState(sablon?.ad || '')
  const [dosyaAdi, setDosyaAdi] = useState(sablon?.dosya_adi || '')
  const [aciklama, setAciklama] = useState(sablon?.aciklama || '')
  const [htmlCode, setHtmlCode] = useState(sablon?.icerik || `<p>Merhaba, {{ffirma_adi}}!</p>`)
  const [testJson, setTestJson] = useState(`{\n  "firma_adi": "Test Firması A.Ş.",\n  "kurumIci": false\n}`)
  const [activeTab, setActiveTab] = useState<'design' | 'preview'>('design')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  const { data: placeholders } = usePlaceholders()
  const saveSablon = useSaveSablon()

  const parsedData = React.useMemo(() => {
    try {
      return JSON.parse(testJson)
    } catch {
      // return empty or keep previous? A simple fallback is {}
      return {}
    }
  }, [testJson])

  // Calculate final HTML synchronously so iframe instantly updates via srcDoc
  const finalHtmlForPreview = (() => {
    try {
      return Mustache.render(htmlCode, parsedData)
    } catch (e) {
      return `<div style="color:red;padding:20px;">Şablon Hatası: ${e}</div>`
    }
  })()

  const handleImportDocx = async () => {
    try {
      const res = await window.electron.ipcRenderer.invoke('import-docx')
      if (res.success && res.html) {
        setHtmlCode(res.html)
        alert('DOCX başarıyla HTML olarak içe aktarıldı.')
      } else if (res.error && res.error !== 'İptal edildi') {
        alert('İçe aktarma hatası: ' + res.error)
      }
    } catch (err: any) {
      alert('Hata: ' + err.message)
    }
  }

  const handleExportHtml = async () => {
    try {
      const finalHtml = Mustache.render(htmlCode, parsedData)
      const res = await window.electron.ipcRenderer.invoke('export-html', finalHtml, { paperSize: 'A4' })
      if (res.success) {
        alert('Şablon başarıyla HTML olarak dışa aktarıldı.')
      } else if (res.error !== 'İptal edildi') {
        alert('Dışa aktarma hatası: ' + res.error)
      }
    } catch (err: any) {
      alert('Hata: ' + err.message)
    }
  }

  const handleSave = async () => {
    if (!ad || !dosyaAdi) {
      alert('Lütfen şablon adı ve dosya adını girin.')
      return
    }

    // Değişken Taraması (Regex ile {{degisken_adi}} ve Mustache döngüleri {{#dizi}})
    const matches = Array.from(htmlCode.matchAll(/\{\{\s*[#/^]?\s*([a-zA-Z0-9_]+)\s*\}\}/g))
    // Benzersiz değişken isimlerini çıkar
    const uniqueVars = Array.from(new Set(matches.map(m => m[1])))

    if (!placeholders) {
      alert('Sistem değişkenleri yüklenemedi.')
      return
    }

    const missingVars = uniqueVars.filter(v => !placeholders.find(p => p.anahtar === v))
    
    if (missingVars.length > 0) {
      const confirmMissing = confirm(`UYARI! Şablonda sistemde kayıtlı olmayan değişkenler var:\n${missingVars.map(v => '{{' + v + '}}').join(', ')}\n\nBu şekilde kaydedilirse bu değişkenler otomatik doldurulmayabilir. Yine de kaydetmek istiyor musunuz?`)
      if (!confirmMissing) return
    } else {
      const isConfirmed = confirm(
        `Bu şablon şu değişkenleri kullanıyor:\n${uniqueVars.map(v => '{{' + v + '}}').join(', ')}\n\n${sablon ? 'Yeni bir versiyon (v' + (sablon.versiyon + 1) + ') oluşturulacak.' : 'Yeni şablon oluşturulacak.'}\nOnaylıyor musunuz?`
      )
      if (!isConfirmed) return
    }

    saveSablon.mutate({
      ad,
      dosya_adi: dosyaAdi,
      dosya_turu: 'docx', // Default docx for now, could be dynamic
      icerik: htmlCode,
      aciklama,
      oldSablon: sablon,
      extractedPlaceholders
    }, {
      onSuccess: () => {
        alert('Şablon başarıyla kaydedildi!')
        onBack()
      },
      onError: (err: any) => {
        alert('Kaydetme hatası: ' + err.message)
      }
    })
  }


  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2 h-auto text-slate-500 hover:text-slate-800 dark:hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {sablon ? `${sablon.ad} (v${sablon.versiyon}) Düzenle` : 'Yeni Şablon Oluştur'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              HTML Şablonunuzu yazın, test verisi girin ve anlık önizleme alın. Yer tutucular için {'{{degisken}}'} kullanın.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={handleImportDocx} variant="outline" className="text-xs font-semibold py-2 flex items-center gap-2 border-slate-200 dark:border-slate-800">
            <Upload className="w-3.5 h-3.5 text-blue-500" />
            DOCX Aç
          </Button>
          <Button onClick={handleExportHtml} className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold py-2 px-4 shadow-md flex items-center gap-2 text-white">
            <Download className="w-3.5 h-3.5" />
            HTML İndir
          </Button>
          <Button onClick={handleSave} disabled={saveSablon.isPending} className="bg-purple-600 hover:bg-purple-700 text-xs font-semibold py-2 px-4 shadow-md flex items-center gap-2 text-white ml-2">
            <Save className="w-3.5 h-3.5" />
            {saveSablon.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex items-center gap-3">
           <input 
             value={ad} 
             onChange={e => setAd(e.target.value)} 
             placeholder="Şablon Adı (Örn: Komisyon Kararı)" 
             className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-slate-800 dark:text-slate-200" 
           />
           <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
           <input 
             value={dosyaAdi} 
             onChange={e => setDosyaAdi(e.target.value)} 
             placeholder="Dosya Adı (Örn: komisyon_karari)" 
             className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-200" 
           />
           <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
           <input 
             value={aciklama} 
             onChange={e => setAciklama(e.target.value)} 
             placeholder="Kısa Açıklama..." 
             className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-200" 
           />
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-2">
        <button
          onClick={() => setActiveTab('design')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'design'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          Word Görünümü (Tasarım)
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Eye className="w-4 h-4" />
          Mustache.js Önizleme
        </button>
      </div>

      {activeTab === 'design' ? (
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <A4Editor content={htmlCode} onChange={setHtmlCode} />
        </div>
      ) : (
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <PanelGroup orientation="horizontal">
            {/* SOL PANEL: TEST VERİSİ */}
            <Panel defaultSize={30} minSize={20}>
              <div className="flex flex-col h-full border-r border-slate-200 dark:border-slate-800">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-500" />
                    <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300">Test Verisi (JSON)</h2>
                  </div>
                </div>
                <div className="flex-1 min-h-0 relative bg-[#1e1e1e]">
                  <textarea
                    className="w-full h-full p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[13px] resize-none outline-none custom-scrollbar border-0"
                    value={testJson}
                    onChange={(e) => setTestJson(e.target.value)}
                    spellCheck={false}
                    placeholder="JSON Test verisi..."
                  />
                </div>
              </div>
            </Panel>

            <ResizeHandle />

            {/* SAĞ PANEL: CANLI ÖNİZLEME */}
            <Panel defaultSize={70} minSize={30}>
              <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300">İndirilecek Çıktı Önizleme (Varsayılan: A4)</h2>
                </div>
                <div className="flex-1 min-h-0 overflow-auto bg-slate-200 dark:bg-slate-800 p-8 flex justify-center custom-scrollbar">
                  <div className="w-[210mm] min-h-[297mm] bg-white shadow-lg border border-slate-300 relative">
                    <iframe
                      ref={iframeRef}
                      title="preview"
                      srcDoc={finalHtmlForPreview}
                      className="w-full h-full border-0 absolute inset-0"
                      sandbox="allow-same-origin allow-scripts"
                    />
                  </div>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      )}
    </div>
  )
}
