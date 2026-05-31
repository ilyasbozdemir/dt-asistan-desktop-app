import React, { useState, useRef, useEffect } from 'react'
import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import * as XLSX from 'xlsx'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'
import {
  Code,
  FileText,
  Upload,
  Download,
  Save,
  LayoutTemplate,
  GripVertical,
  Database
} from 'lucide-react'
import { Button } from '../../components/ui/Button'

loader.config({ monaco })

export default function SablonlarScreen(): React.JSX.Element {
  const [htmlCode, setHtmlCode] = useState(
    `<div style="font-family: Arial, sans-serif; padding: 20px;">\n  <h1 style="color: #2563eb;">Merhaba, {{ad}}!</h1>\n  <p>Şablon sistemine hoş geldin. Yıl: {{tarih}}</p>\n</div>`
  )
  const [testJson, setTestJson] = useState(`{\n  "ad": "İlyas",\n  "tarih": "2026"\n}`)
  const [parsedData, setParsedData] = useState<Record<string, any>>({})
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Parse JSON real-time
  useEffect(() => {
    try {
      const data = JSON.parse(testJson)
      setParsedData(data)
    } catch {
      // do nothing, wait for valid json
    }
  }, [testJson])

  // Update preview real-time
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        // Replace placeholders {{key}}
        const finalHtml = htmlCode.replace(/\{\{(\w+)\}\}/g, (_, key) => parsedData[key] ?? '')
        doc.write(finalHtml)
        doc.close()
      }
    }
  }, [htmlCode, parsedData])

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

  const handleImportXlsx = async () => {
    try {
      const res = await window.electron.ipcRenderer.invoke('import-xlsx')
      if (res.success && res.data) {
        const workbook = XLSX.read(res.data, { type: 'buffer' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        
        // Populate JSON editor with first row if it's array
        if (json.length > 0) {
          setTestJson(JSON.stringify(json[0], null, 2))
        } else {
          setTestJson(JSON.stringify(json, null, 2))
        }
        alert('XLSX başarıyla JSON olarak içe aktarıldı.')
      } else if (res.error && res.error !== 'İptal edildi') {
        alert('İçe aktarma hatası: ' + res.error)
      }
    } catch (err: any) {
      alert('Hata: ' + err.message)
    }
  }

  const handleExportDocx = async () => {
    try {
      const finalHtml = htmlCode.replace(/\{\{(\w+)\}\}/g, (_, key) => parsedData[key] ?? '')
      const res = await window.electron.ipcRenderer.invoke('export-docx', finalHtml)
      if (res.success) {
        alert('Şablon başarıyla DOCX olarak dışa aktarıldı.')
      } else if (res.error !== 'İptal edildi') {
        alert('Dışa aktarma hatası: ' + res.error)
      }
    } catch (err: any) {
      alert('Hata: ' + err.message)
    }
  }

  const handleExportXlsx = async () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet([parsedData])
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sayfa1')

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const res = await window.electron.ipcRenderer.invoke('export-xlsx', excelBuffer)
      
      if (res.success) {
        alert('Veriler başarıyla XLSX olarak kaydedildi.')
      } else if (res.error !== 'İptal edildi') {
        alert('Hata: ' + res.error)
      }
    } catch (e: any) {
      alert('Beklenmeyen bir hata oluştu: ' + e.message)
    }
  }

  const ResizeHandle = () => (
    <PanelResizeHandle className="w-2 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 transition-colors cursor-col-resize group">
      <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
    </PanelResizeHandle>
  )

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-purple-500" />
            Şablon Editörü & Playground
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            HTML Şablonunuzu yazın, test verisi girin ve anlık önizleme alın. Yer tutucular için {'{{degisken}}'} kullanabilirsiniz.
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={handleImportDocx} variant="outline" className="text-xs font-semibold py-2 flex items-center gap-2 border-slate-200 dark:border-slate-800">
            <Upload className="w-3.5 h-3.5 text-blue-500" />
            DOCX Aç
          </Button>
          <Button onClick={handleImportXlsx} variant="outline" className="text-xs font-semibold py-2 flex items-center gap-2 border-slate-200 dark:border-slate-800">
            <Upload className="w-3.5 h-3.5 text-emerald-500" />
            XLSX Aç
          </Button>
          <Button onClick={handleExportDocx} className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold py-2 px-4 shadow-md flex items-center gap-2 text-white">
            <Download className="w-3.5 h-3.5" />
            DOCX İndir
          </Button>
          <Button onClick={handleExportXlsx} className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold py-2 px-4 shadow-md flex items-center gap-2 text-white">
            <Download className="w-3.5 h-3.5" />
            XLSX İndir
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-xs font-semibold py-2 px-4 shadow-md flex items-center gap-2 text-white ml-2">
            <Save className="w-3.5 h-3.5" />
            Kaydet
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <PanelGroup direction="horizontal">
          
          {/* SOL PANEL: HTML KODU */}
          <Panel defaultSize={35} minSize={20}>
            <div className="flex flex-col h-full border-r border-slate-200 dark:border-slate-800">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300">Şablon Kodu (HTML)</h2>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  language="html"
                  value={htmlCode}
                  onChange={(val) => setHtmlCode(val || '')}
                  theme="vs-dark"
                  options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on' }}
                />
              </div>
            </div>
          </Panel>

          <ResizeHandle />

          {/* ORTA PANEL: TEST VERİSİ */}
          <Panel defaultSize={30} minSize={20}>
            <div className="flex flex-col h-full border-r border-slate-200 dark:border-slate-800">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300">Test Verisi (JSON)</h2>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  language="json"
                  value={testJson}
                  onChange={(val) => setTestJson(val || '')}
                  theme="vs-dark"
                  options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on' }}
                />
              </div>
            </div>
          </Panel>

          <ResizeHandle />

          {/* SAĞ PANEL: CANLI ÖNİZLEME */}
          <Panel defaultSize={35} minSize={20}>
            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300">Canlı Önizleme</h2>
              </div>
              <div className="flex-1 overflow-auto bg-white dark:bg-slate-950 p-4">
                <iframe
                  ref={iframeRef}
                  title="preview"
                  className="w-full h-full border-0 rounded"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </Panel>

        </PanelGroup>
      </div>
    </div>
  )
}
