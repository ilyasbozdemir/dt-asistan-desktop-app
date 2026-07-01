import React, { useState } from 'react'
import {
  FileCheck,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileArchive,
  Download,
  Trash2,
  Eye,
  Loader2
} from 'lucide-react'
import { SubScreen } from '../SubScreens.screen'

interface SignedDoc {
  id: number
  documentName: string
  signerName: string
  signDate: string
  status: 'Signed' | 'Pending'
}

export function ImzaliBelgeler(): React.JSX.Element {
  const [isExtracting, setIsExtracting] = useState(false)
  const [zipFile, setZipFile] = useState<string | null>(null)
  const [documents, setDocuments] = useState<SignedDoc[]>([
    {
      id: 1,
      documentName: 'Onay Belgesi.pdf',
      signerName: 'İlyas BOZDEMİR (Harcama Yetkilisi)',
      signDate: '2026-06-29 14:32',
      status: 'Signed'
    },
    {
      id: 2,
      documentName: 'Piyasa Fiyat Arastirmasi Tutanagi.pdf',
      signerName: 'Ali YILMAZ (Komisyon Üyesi)',
      signDate: '2026-06-29 11:15',
      status: 'Signed'
    },
    {
      id: 3,
      documentName: 'Yaklasik Maliyet Hesap Cetveli.pdf',
      signerName: 'Bekliyor',
      signDate: '-',
      status: 'Pending'
    }
  ])

  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setZipFile(file.name)
      setIsExtracting(true)

      // Simulate extraction
      setTimeout(() => {
        setIsExtracting(false)
        setDocuments((prev) => [
          {
            id: Date.now(),
            documentName: 'Yaklasik Maliyet Hesap Cetveli (İmzalı).pdf',
            signerName: 'Ahmet DEMİR (Gerçekleştirme Görevlisi)',
            signDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
            status: 'Signed'
          },
          ...prev
        ])
      }, 2000)
    }
  }

  const handleDelete = (id: number) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  return (
    <SubScreen
      title="İmzalı Belge Yönetimi"
      icon={FileCheck}
      description="İmzalanan evrakları toplu olarak ZIP dosyası ile sisteme yükleyin, arşivleyin ve yönetin."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            İmzalanan Belgeler
          </span>
          <h3 className="text-3xl font-extrabold mt-1 text-green-600 dark:text-green-500">
            {documents.filter((d) => d.status === 'Signed').length} / {documents.length}
          </h3>
          <p className="text-xs text-slate-400 mt-2">Toplam belgenin imzalılık oranı</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Bekleyen İmzalar
          </span>
          <h3 className="text-3xl font-extrabold mt-1 text-amber-600 dark:text-amber-500">
            {documents.filter((d) => d.status === 'Pending').length} Belge
          </h3>
          <p className="text-xs text-slate-400 mt-2">İmzası tamamlanması gerekenler</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Son ZIP Yükleme
          </span>
          <h3 className="text-lg font-bold mt-1 text-slate-800 dark:text-white truncate">
            {zipFile || 'Yükleme Yapılmadı'}
          </h3>
          <p className="text-xs text-slate-400 mt-3">En son içeri aktarılan ZIP paketi</p>
        </div>
      </div>

      {/* ZIP UPLOAD PANEL */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
            <FileArchive className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Toplu ZIP ile İmzalı Belge Yükle
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
              EBYS veya Islak İmzalı taranan belgelerinizi tek bir ZIP dosyası halinde yükleyin.
              Sistem dosya isimlerinden otomatik eşleştirerek durumlarını güncelleyecektir.
            </p>
          </div>
        </div>

        <div>
          {isExtracting ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-xs font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" />
              ZIP Çıkartılıyor...
            </div>
          ) : (
            <label className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer transition-colors flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4" />
              ZIP Seç ve Yükle
              <input
                type="file"
                accept=".zip"
                onChange={handleZipUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* DOCUMENT CHECKLIST */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Belge İmza Durumu ve Eşleşmeler
          </h4>
          <button className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Tümünü İndir (.ZIP)
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
            >
              <div className="flex items-start gap-3">
                {doc.status === 'Signed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {doc.documentName}
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    İmzalayan / Durum: <span className="font-semibold">{doc.signerName}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  {doc.signDate !== '-' ? doc.signDate : 'İmza Bekleniyor'}
                </span>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" title="Belgeyi Görüntüle">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                    title="Belgeyi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SubScreen>
  )
}
