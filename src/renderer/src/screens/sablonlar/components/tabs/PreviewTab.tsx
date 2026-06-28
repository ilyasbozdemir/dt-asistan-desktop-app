import React, { useState } from 'react'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'
import { FileText, Database, GripVertical, ExternalLink } from 'lucide-react'
import Editor from '@monaco-editor/react'

const VerticalResizeHandle = (): React.ReactElement => (
  <PanelResizeHandle className="w-2 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 transition-colors cursor-col-resize group">
    <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
  </PanelResizeHandle>
)

interface PreviewTabProps {
  htmlCode: string
  setHtmlCode: (code: string) => void
  testJson: string
  setTestJson: (json: string) => void
  finalHtmlForPreview: string
}

export function PreviewTab({
  htmlCode,
  setHtmlCode,
  testJson,
  setTestJson,
  finalHtmlForPreview
}: PreviewTabProps): React.ReactElement {
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const [activeEditorTab, setActiveEditorTab] = useState<'html' | 'json'>('html')

  const handleOpenNewWindow = () => {
    const newWin = window.open('', '_blank', 'width=900,height=1000')
    if (newWin) {
      newWin.document.open()
      newWin.document.write(finalHtmlForPreview)
      newWin.document.close()
    }
  }

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <PanelGroup orientation="horizontal">
        {/* SOL PANEL: HTML VE TEST VERİSİ TABLARI */}
        <Panel defaultSize={35} minSize={20}>
          <div className="flex flex-col h-full border-r border-slate-200 dark:border-slate-800 bg-[#1e1e1e]">
            {/* TABS HEADER */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <button
                onClick={() => setActiveEditorTab('html')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-colors ${
                  activeEditorTab === 'html'
                    ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-t-2 border-transparent'
                }`}
              >
                <FileText className="w-4 h-4" />
                Şablon (Ham HTML)
              </button>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
              <button
                onClick={() => setActiveEditorTab('json')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-colors ${
                  activeEditorTab === 'json'
                    ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-t-2 border-transparent'
                }`}
              >
                <Database className="w-4 h-4" />
                Test Verisi (JSON)
              </button>
            </div>

            {/* EDITOR BODY */}
            <div className="flex-1 min-h-0 relative">
              {activeEditorTab === 'html' ? (
                <Editor
                  height="100%"
                  defaultLanguage="html"
                  theme="vs-dark"
                  value={htmlCode}
                  onChange={(value) => setHtmlCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    wordWrap: 'on',
                    fontSize: 13,
                    padding: { top: 16 }
                  }}
                />
              ) : (
                <Editor
                  height="100%"
                  defaultLanguage="json"
                  theme="vs-dark"
                  value={testJson}
                  onChange={(value) => setTestJson(value || '')}
                  options={{
                    minimap: { enabled: false },
                    wordWrap: 'on',
                    fontSize: 13,
                    padding: { top: 16 }
                  }}
                />
              )}
            </div>
          </div>
        </Panel>

        <VerticalResizeHandle />

        {/* SAĞ PANEL: CANLI ÖNİZLEME */}
        <Panel defaultSize={65} minSize={30}>
          <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  İndirilecek Çıktı Önizleme (Varsayılan: A4)
                </h2>
              </div>
              <button
                onClick={handleOpenNewWindow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                title="Önizlemeyi geniş, ayrı bir pencerede aç"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Yeni Pencerede Aç
              </button>
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
  )
}
