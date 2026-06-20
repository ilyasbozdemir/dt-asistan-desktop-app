import React, { useState } from 'react'
import { FileText, Download, ExternalLink, HelpCircle, FileSpreadsheet } from 'lucide-react'
import { ExcelViewer } from '../../components/ui/ExcelViewer'

const DOCUMENTS = [
  {
    category: 'Resmi Yazışma ve Kullanıcı Kılavuzları',
    items: [
      {
        id: 'resmi_yazisma_kurallari',
        title: 'Resmi Yazışma Kuralları',
        description: 'Resmi yazışmalarda uyulması gereken kurallar ve standartlar.',
        file: '/docs/resmi_yazisma_kurallari.pdf'
      },
      {
        id: 'resmi_yazismalarda_uygulanacak_usul_ve_esaslar_yonetmelik_kilavuzu',
        title: 'Resmi Yazışmalar Yönetmelik Kılavuzu',
        description: 'Resmi Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik Kılavuzu.',
        file: '/docs/resmi_yazismalarda_uygulanacak_usul_ve_esaslar_yonetmelik_kilavuzu.pdf'
      },
      {
        id: 'dogrudan_temin_son_kullanici_kilavuzu',
        title: 'Doğrudan Temin Son Kullanıcı Kılavuzu',
        description: 'Doğrudan Temin süreci ve uygulamanın kullanımı hakkında son kullanıcı kılavuzu.',
        file: '/docs/dogrudan_temin_son_kullanici_kilavuzu.pdf'
      },
      {
        id: '20200610-8',
        title: 'Faydalı Doküman (20200610-8)',
        description: 'İlgili resmi mevzuat dokümanı.',
        file: '/docs/20200610-8.pdf'
      }
    ]
  },
  {
    category: 'Muhasebat & Maliyet Dokümanları',
    items: [
      {
        id: 'guncel_tasinir_kod_listesi',
        title: 'Güncel Taşınır Kod Listesi',
        description: 'Taşınır hesap planı ve kod listesi (Güncel).',
        file: '/docs/muhasebat/guncel_tasinir_kod_listesi.xls'
      },
      {
        id: '2018_mahalli_idareler_detayli_hesap_plani',
        title: 'Mahalli İdareler Detaylı Hesap Planı (2018)',
        description: 'Mahalli idareler için detaylı muhasebat hesap planı excel tablosu.',
        file: '/docs/muhasebat/2018_mahalli_idareler_detayli_hesap_plani.xls'
      },
      {
        id: 'defter_belge_ve_cetvel_ornekleri',
        title: 'Defter, Belge ve Cetvel Örnekleri',
        description: 'Muhasebat süreçleri için defter, belge ve cetvel örnekleri.',
        file: '/docs/muhasebat/defter_belge_ve_cetvel_ornekleri.xlsx'
      },
      {
        id: 'ek_10_teslim_sureleri_tablosu',
        title: 'EK-10 Teslim Süreleri Tablosu',
        description: 'Resmi evrak ve faturaların teslim süreleri tablosu.',
        file: '/docs/muhasebat/ek_10_teslim_sureleri_tablosu.xlsx'
      },
      {
        id: 'kurumsal_2019_2021',
        title: 'Kurumsal Muhasebat Kılavuzu (2019-2021)',
        description: 'Kurumsal kılavuz ve mali istatistikler (2019-2021).',
        file: '/docs/muhasebat/kurumsal_2019_2021.pdf'
      },
      {
        id: '5816_2',
        title: 'Mali Mevzuat Dokümanı (5816_2)',
        description: 'Maliye ve Muhasebat ilgili mevzuat PDF dokümanı.',
        file: '/docs/muhasebat/5816_2.pdf'
      }
    ]
  }
]

export default function YardimScreen(): React.JSX.Element {
  const [activeDoc, setActiveDoc] = useState(DOCUMENTS[0].items[0])

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-500">
      <div className="flex-none p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
          <HelpCircle className="w-7 h-7 text-blue-600" />
          Yardım ve Faydalı Dokümanlar
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Sistemi kullanırken faydalanabileceğiniz resmi mevzuat, kullanım kılavuzları ve muhasebat tablolarına buradan ulaşabilirsiniz.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Document List */}
        <div className="w-[340px] flex-none border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {DOCUMENTS.map((group) => (
            <div key={group.category} className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-3">
                {group.category}
              </h2>
              {group.items.map((doc) => {
                const isExcel = doc.file.endsWith('.xls') || doc.file.endsWith('.xlsx')
                return (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDoc(doc)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                      activeDoc.id === doc.id
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 shadow-sm'
                        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 dark:hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isExcel ? (
                        <FileSpreadsheet className={`w-5 h-5 shrink-0 mt-0.5 ${activeDoc.id === doc.id ? 'text-green-600 dark:text-green-500' : 'text-slate-400'}`} />
                      ) : (
                        <FileText className={`w-5 h-5 shrink-0 mt-0.5 ${activeDoc.id === doc.id ? 'text-blue-600' : 'text-slate-400'}`} />
                      )}
                      <div>
                        <h3 className={`text-sm font-semibold mb-1 leading-tight ${activeDoc.id === doc.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {doc.title}
                        </h3>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-normal">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Right Content - PDF / Excel Viewer Placeholder */}
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
          <div className="flex-none p-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm z-10">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              {activeDoc.file.endsWith('.xls') || activeDoc.file.endsWith('.xlsx') ? (
                <FileSpreadsheet className="w-4 h-4 text-green-500" />
              ) : (
                <FileText className="w-4 h-4 text-blue-500" />
              )}
              {activeDoc.title}
            </h2>
            <div className="flex items-center gap-2">
              <a
                href={activeDoc.file}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Yeni Sekmede Aç / Dışarıda Görüntüle"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Dışarıda Aç
              </a>
              <a
                href={activeDoc.file}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                İndir
              </a>
            </div>
          </div>
          
          <div className="flex-1 w-full h-full relative z-0 overflow-hidden bg-white dark:bg-slate-950">
            {activeDoc.file.endsWith('.pdf') ? (
              <div className="p-4 w-full h-full">
                <iframe
                  src={`${activeDoc.file}#view=FitH`}
                  className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white"
                  title={activeDoc.title}
                />
              </div>
            ) : activeDoc.file.endsWith('.xls') || activeDoc.file.endsWith('.xlsx') ? (
              <ExcelViewer fileUrl={activeDoc.file} />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="flex flex-col items-center text-center max-w-sm">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-400">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {activeDoc.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-8">Önizleme desteklenmiyor.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
