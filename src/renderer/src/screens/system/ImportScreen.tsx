import React, { useState, useMemo } from 'react'
import {
  FileJson,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useNavigate } from '@tanstack/react-router'
import { useTabStore } from '../../store/tabStore'

interface TargetTable {
  id: string
  label: string
  columns: string[]
}

const TARGET_TABLES: TargetTable[] = [
  {
    id: 'TANIM_Firma',
    label: 'İstekli Firmalar',
    columns: [
      'eski_id',
      'firma_kodu',
      'unvan',
      'ilgili_adi',
      'uyrugu',
      'istigal_konusu',
      'adres',
      'ilce',
      'posta_kodu',
      'il',
      'telefon',
      'faks',
      'email',
      'web_adresi',
      'banka_adi',
      'sube_kodu_adi',
      'hesap_no',
      'tc_kimlik_no',
      'dogum_tarihi',
      'vergi_dairesi',
      'vergi_no',
      'aktif_mi',
      'created_at'
    ]
  },
  {
    id: 'TANIM_Personel',
    label: 'Personel Listesi',
    columns: [
      'eski_id',
      'ad_soyad',
      'unvan',
      'birim',
      'sicil_no',
      'telefon',
      'eposta',
      'ihale_yetkilisi_mi',
      'harcama_yetkilisi_mi',
      'aktif_mi',
      'notlar',
      'created_at'
    ]
  },
  {
    id: 'TANIM_Birim',
    label: 'Birimler',
    columns: [
      'eski_id',
      'birim_adi',
      'antet_ek_satir',
      'ihtiyac_yeri_eki',
      'sunum_makami',
      'e_butce',
      'say2000i',
      'dtvt_kodu',
      'ayrintili_bilgi_personel',
      'aktif_mi',
      'created_at'
    ]
  },
  {
    id: 'TANIM_Kalem',
    label: 'Malzeme/Hizmet Kalemleri',
    columns: [
      'eski_id',
      'barkod_id',
      'tasinir_kodu',
      'okas_kodu',
      'kalem_adi',
      'tipi',
      'birim',
      'kategori',
      'ozelligi',
      'kdv_orani',
      'mensei',
      'is_personel',
      'personel_asgari_fark_oran',
      'aktif_mi',
      'notlar',
      'created_at'
    ]
  },
  {
    id: 'TANIM_Ambar',
    label: 'Ambar',
    columns: ['eski_id', 'ambar_kodu', 'ambar_adi', 'aktif_mi', 'created_at']
  },
  {
    id: 'settings',
    label: 'Kurum Bilgileri (Ayarlar)',
    columns: [
      'institutionName',
      'institutionLetterhead',
      'recipientTitle',
      'parentInstitution',
      'logoLeft',
      'logoRight',
      'institutionLogo',
      'limitType',
      'finansmanKodu',
      'institutionType',
      'eButceKodu',
      'say2000iKodu',
      'fonksiyonelKod',
      'muhasebeBirimKodu',
      'muhasebeBirimAdi',
      'harcamaBirimKodu',
      'harcamaBirimAdi',
      'dtvtKodu',
      'address',
      'district',
      'postalCode',
      'city',
      'phone',
      'fax',
      'institutionEmail',
      'website'
    ]
  }
]

export default function ImportScreen(): React.JSX.Element {
  const navigate = useNavigate()
  const { addTab } = useTabStore()
  const [jsonText, setJsonText] = useState('')
  const [targetId, setTargetId] = useState<string>('TANIM_Firma')
  const [parsedData, setParsedData] = useState<any[] | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    count?: number
    total?: number
    error?: string
  } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleParse = () => {
    try {
      setParseError(null)
      setImportResult(null)

      let data: any
      try {
        data = JSON.parse(jsonText)
      } catch (err) {
        const match = jsonText.match(/\[[\s\S]*\]/)
        if (match) {
          try {
            data = new Function(`return ${match[0]}`)()
          } catch (evalErr) {
            throw new Error('Geçersiz format. Hem standart JSON hem de JS formatı ayrıştırılamadı.')
          }
        } else {
          throw new Error(
            'Geçerli bir JSON veya JS dizisi (Array) bekliyoruz. Örn: [ { "ad": "X" } ]'
          )
        }
      }

      if (!Array.isArray(data)) {
        throw new Error('Veri bir dizi (Array) formatında olmalıdır.')
      }
      if (data.length === 0) {
        throw new Error('Dizi boş.')
      }
      setParsedData(data)

      // Auto-map where keys match exactly
      const firstObj = data[0] || {}
      const keys = Object.keys(firstObj)
      const targetTable = TARGET_TABLES.find((t) => t.id === targetId)

      const newMappings: Record<string, string> = {}
      keys.forEach((key) => {
        if (targetTable?.columns.includes(key)) {
          newMappings[key] = key
        }
      })
      setMappings(newMappings)
    } catch (err: any) {
      setParseError(err.message)
      setParsedData(null)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setJsonText(content)
      setParseError(null)
      setParsedData(null)
      setImportResult(null)
    }
    reader.readAsText(file)
    // reset input so the same file can be uploaded again if needed
    e.target.value = ''
  }

  const targetTable = useMemo(() => TARGET_TABLES.find((t) => t.id === targetId), [targetId])

  const jsonKeys = useMemo(() => {
    if (!parsedData || parsedData.length === 0) return []
    // extract all unique keys from first few objects to be safe, but just first is usually enough
    const keys = new Set<string>()
    parsedData.slice(0, 10).forEach((obj) => {
      Object.keys(obj).forEach((k) => keys.add(k))
    })
    return Array.from(keys)
  }, [parsedData])

  const handleMappingChange = (jsonKey: string, dbColumn: string) => {
    setMappings((prev) => {
      const updated = { ...prev }
      if (!dbColumn) {
        delete updated[jsonKey]
      } else {
        updated[jsonKey] = dbColumn
      }
      return updated
    })
  }

  const handleImport = async () => {
    if (!parsedData || Object.keys(mappings).length === 0) return

    setIsImporting(true)
    setImportResult(null)
    try {
      const res = await window.electron.ipcRenderer.invoke('db:bulk-import', {
        target: targetId,
        mappings,
        data: parsedData
      })
      setImportResult(res)
      if (res.success) {
        setToast({
          message: `İçe aktarma tamamlandı: ${res.count} kayıt eklendi.`,
          type: 'success'
        })
        setTimeout(() => setToast(null), 5000)
        // clear if success
        setJsonText('')
        setParsedData(null)
        setMappings({})
      } else {
        setToast({ message: `İçe aktarma hatası: ${res.error}`, type: 'error' })
        setTimeout(() => setToast(null), 5000)
      }
    } catch (err: any) {
      setImportResult({ success: false, error: err.message })
      setToast({ message: `Sistemsel Hata: ${err.message}`, type: 'error' })
      setTimeout(() => setToast(null), 5000)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <Upload className="w-8 h-8 text-blue-500" />
            Toplu Veri İçe Aktarma
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Kayıtlı JSON verilerinizi sisteme hızlıca dahil edin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                1
              </span>
              Kaynak ve Hedef
            </h3>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Hedef Tablo
            </label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm mb-4 outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200"
              value={targetId}
              onChange={(e) => {
                setTargetId(e.target.value)
                setParsedData(null)
              }}
            >
              {TARGET_TABLES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>

            <div className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex justify-between items-center">
              <span>JSON Verisi</span>
              <label className="text-blue-500 cursor-pointer hover:underline text-xs flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Dosya Yükle</span>
                <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            <textarea
              className="w-full h-64 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-700 dark:text-slate-200"
              placeholder={'[\n  { "unvan": "Örnek Firma", "sehir": "Ankara" }\n]'}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />

            {parseError && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            <Button
              onClick={handleParse}
              className="w-full mt-4"
              disabled={!jsonText.trim()}
              variant="default"
            >
              <FileJson className="w-4 h-4 mr-2" />
              Veriyi Oku ve Eşleştir
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 h-full flex flex-col">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                2
              </span>
              Sütun Eşleştirme ve Aktarım
            </h3>

            {!parsedData ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <ArrowRight className="w-8 h-8 mb-3 text-slate-300 dark:text-slate-600" />
                Devam etmek için sol taraftan geçerli bir JSON girip "Veriyi Oku" butonuna tıklayın.
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="text-sm text-blue-700 dark:text-blue-300 mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center gap-2 border border-blue-100 dark:border-blue-800">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span>
                    Başarıyla <strong>{parsedData.length}</strong> kayıt algılandı.
                  </span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                  JSON ALANLARI → HEDEF SÜTUNLAR
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[300px]">
                  {jsonKeys.map((key) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50"
                    >
                      <div
                        className="flex-1 text-xs font-mono truncate text-slate-700 dark:text-slate-300"
                        title={key}
                      >
                        {key}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                      <select
                        className="flex-1 h-8 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-blue-500"
                        value={mappings[key] || ''}
                        onChange={(e) => handleMappingChange(key, e.target.value)}
                      >
                        <option value="">-- Atla --</option>
                        {targetTable?.columns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {importResult && (
                  <div
                    className={`mt-4 p-3 text-sm rounded-lg flex flex-col gap-2 ${importResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}
                  >
                    <div className="flex items-start gap-2">
                      {importResult.success ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="font-bold text-[13px] text-green-800 dark:text-green-300">
                              İçe Aktarma İşlemi Tamamlandı
                            </div>
                            <p className="text-xs text-green-700/90 dark:text-green-400/90 leading-relaxed">
                              İşlenen toplam <strong>{importResult.total}</strong> kayıttan{' '}
                              <strong>{importResult.count}</strong> tanesi sisteme başarıyla
                              eklendi.
                            </p>
                            {importResult.total !== undefined &&
                              importResult.count !== undefined &&
                              importResult.total > importResult.count && (
                                <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-start gap-2.5 text-amber-800 dark:text-amber-400 text-xs shadow-sm">
                                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
                                  <div>
                                    <strong className="text-amber-900 dark:text-amber-300">
                                      {importResult.total - importResult.count} kayıt sisteme
                                      eklenemedi ve atlandı.
                                    </strong>
                                    <p className="mt-1 opacity-90">Olası Sebepler:</p>
                                    <ul className="list-disc pl-4 mt-0.5 space-y-0.5 opacity-80">
                                      <li>
                                        Sistemde aynı benzersiz değere (Kod, Barkod, TC, Vergi No)
                                        sahip kayıt zaten var.
                                      </li>
                                      <li>
                                        Zorunlu alanları (Ad, Tip) boş bıraktınız veya doğru
                                        eşleştirmediniz.
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              )}
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 shrink-0" />
                          <span>Hata: {importResult.error}</span>
                        </>
                      )}
                    </div>
                    {importResult.success && (
                      <div className="flex justify-end mt-1">
                        <Button
                          variant="outline"
                          className="bg-white border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 text-xs py-1 h-7 gap-1.5 shadow-sm"
                          onClick={() => {
                            const route =
                              targetId === 'TANIM_Birim'
                                ? '/birimler'
                                : targetId === 'TANIM_Firma'
                                  ? '/firmalar'
                                  : targetId === 'TANIM_Personel'
                                    ? '/personel'
                                    : targetId === 'TANIM_Kalem'
                                      ? '/malzemeler'
                                      : targetId === 'TANIM_Ambar'
                                        ? '/ambar'
                                        : targetId === 'settings'
                                          ? '/kurum'
                                          : '/'
                            addTab(route)
                            navigate({ to: route as any })
                          }}
                        >
                          Sonucu Gör <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleImport}
                  disabled={isImporting || Object.keys(mappings).length === 0}
                  className="w-full mt-6 flex justify-center items-center gap-2"
                  variant={importResult?.success ? 'secondary' : 'default'}
                >
                  {isImporting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isImporting ? 'Aktarılıyor...' : 'Eşleşenleri İçe Aktar'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl border text-sm flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50 transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/80 dark:border-green-800 dark:text-green-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/80 dark:border-red-800 dark:text-red-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <div className="font-medium">{toast.message}</div>
        </div>
      )}
    </div>
  )
}
