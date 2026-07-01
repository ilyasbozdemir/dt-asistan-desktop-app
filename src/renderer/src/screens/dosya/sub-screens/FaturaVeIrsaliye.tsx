import React, { useState } from 'react'
import {
  CreditCard,
  Upload,
  Trash2,
  Eye,
  Plus,
  Search,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { SubScreen } from '../SubScreens.screen'

interface InvoiceFile {
  id: number
  fileName: string
  fileType: 'fatura' | 'irsaliye'
  amount: number
  date: string
  status: 'Approved' | 'Pending'
}

export function FaturaVeIrsaliye(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'fatura' | 'irsaliye'>('all')
  const [files, setFiles] = useState<InvoiceFile[]>([
    {
      id: 1,
      fileName: 'Hizmet_Alim_Faturasi_00281.pdf',
      fileType: 'fatura',
      amount: 14500.0,
      date: '2026-06-28',
      status: 'Approved'
    },
    {
      id: 2,
      fileName: 'Malzeme_Teslim_Irsaliyesi_192.pdf',
      fileType: 'irsaliye',
      amount: 0,
      date: '2026-06-25',
      status: 'Approved'
    },
    {
      id: 3,
      fileName: 'Kirtasiye_Alimi_Faturasi_998.pdf',
      fileType: 'fatura',
      amount: 3200.5,
      date: '2026-06-20',
      status: 'Pending'
    }
  ])

  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFile: InvoiceFile = {
        id: Date.now(),
        fileName: e.dataTransfer.files[0].name,
        fileType: e.dataTransfer.files[0].name.toLowerCase().includes('irsaliye') ? 'irsaliye' : 'fatura',
        amount: e.dataTransfer.files[0].name.toLowerCase().includes('irsaliye') ? 0 : 2500.0,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
      }
      setFiles((prev) => [newFile, ...prev])
    }
  }

  const handleDelete = (id: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || f.fileType === filterType
    return matchesSearch && matchesType
  })

  const totalInvoiced = files
    .filter((f) => f.fileType === 'fatura')
    .reduce((sum, f) => sum + f.amount, 0)

  return (
    <SubScreen
      title="Fatura ve İrsaliye Yönetimi"
      icon={CreditCard}
      description="Doğrudan temin dosyasına ait fatura, irsaliye, e-arşiv faturaları yükleyin ve yönetin."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* STATS */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
          <div>
            <span className="text-blue-100 text-xs font-semibold uppercase tracking-wider">
              Toplam Fatura Tutarı
            </span>
            <h3 className="text-3xl font-extrabold mt-1">
              ₺{totalInvoiced.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-100 mt-4">
            <TrendingUp className="w-4 h-4" />
            <span>Aktif dosyaya kaydedilmiş fatura toplamı</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Toplam Evrak Sayısı
            </span>
            <h3 className="text-3xl font-extrabold mt-1 text-slate-800 dark:text-white">
              {files.length} Adet
            </h3>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-4 flex items-center gap-1">
            <span>{files.filter((f) => f.fileType === 'fatura').length} Fatura, </span>
            <span>{files.filter((f) => f.fileType === 'irsaliye').length} İrsaliye</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Onay Bekleyenler
            </span>
            <h3 className="text-3xl font-extrabold mt-1 text-amber-600 dark:text-amber-500">
              {files.filter((f) => f.status === 'Pending').length} Belge
            </h3>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-4 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>İncelenmesi gereken yeni yüklenmiş dosyalar</span>
          </div>
        </div>
      </div>

      {/* UPLOADER */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-955/10'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
        }`}
      >
        <Upload className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Dosyaları buraya sürükleyin veya seçmek için tıklayın
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          PDF, PNG, JPEG formatlarında fatura veya irsaliye belgeleri (Maks 15MB)
        </p>
        <button
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'application/pdf,image/*'
            input.onchange = (e: any) => {
              if (e.target.files && e.target.files[0]) {
                const newFile: InvoiceFile = {
                  id: Date.now(),
                  fileName: e.target.files[0].name,
                  fileType: e.target.files[0].name.toLowerCase().includes('irsaliye') ? 'irsaliye' : 'fatura',
                  amount: e.target.files[0].name.toLowerCase().includes('irsaliye') ? 0 : 3500.0,
                  date: new Date().toISOString().split('T')[0],
                  status: 'Pending'
                }
                setFiles((prev) => [newFile, ...prev])
              }
            }
            input.click()
          }}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Dosya Seç
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between mt-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilterType('fatura')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'fatura'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Faturalar
          </button>
          <button
            onClick={() => setFilterType('irsaliye')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'irsaliye'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            İrsaliyeler
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Dosya adı ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Belge Tipi</th>
                <th className="p-4">Dosya Adı</th>
                <th className="p-4">Tutar</th>
                <th className="p-4">Tarih</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400 dark:text-slate-600">
                    Eşleşen belge bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4">
                      {file.fileType === 'fatura' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                          Fatura
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          İrsaliye
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {file.fileName}
                    </td>
                    <td className="p-4 font-mono text-slate-700 dark:text-slate-300">
                      {file.fileType === 'fatura'
                        ? `₺${file.amount.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2
                          })}`
                        : '-'}
                    </td>
                    <td className="p-4 text-slate-500">{file.date}</td>
                    <td className="p-4">
                      {file.status === 'Approved' ? (
                        <span className="text-green-600 dark:text-green-400 font-semibold">Onaylandı</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-500 font-semibold">İnceleniyor</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" title="Görseli Önizle">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                          title="Belgeyi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SubScreen>
  )
}
