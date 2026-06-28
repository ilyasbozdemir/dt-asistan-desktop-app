import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Save,
  Search,
  PackageSearch,
  Barcode,
  Database,
  Activity,
  Edit2,
  Bot,
  Loader2
} from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMalzemelerHooks, Kalem } from './malzemeler.hooks'
import { useOlcuBirimleri } from '../olcubirimleri/olcubirimleri.hooks'
import { useOkasKodHooks } from '../okaskod/okaskod.hooks'
import { useTasinirKodHooks } from '../tasinirkod/tasinirkod.hooks'

export default function YeniMalzemeScreen(): React.JSX.Element {
  useEffect(() => {
    document.title = 'Mal/Hizmet/Yapım İşi Ekle - DT'
  }, [])

  const navigate = useNavigate()
  const { addKalem } = useMalzemelerHooks()
  const { data: birimler = [] } = useOlcuBirimleri()
  const { okasKodList, isLoading: isOkasLoading } = useOkasKodHooks()
  const { tasinirKodList, isLoading: isTasinirLoading } = useTasinirKodHooks()

  // Form State
  const [formData, setFormData] = useState<Partial<Kalem>>(() => ({
    tipi: 'Mal',
    birim: 'Adet',
    kdv_orani: 0,
    aktif_mi: 1,
    personel_asgari_fark_oran: 0,
    barkod_id: Math.floor(1000000000000 + Math.random() * 9000000000000).toString()
  }))

  const [isOkasModalOpen, setIsOkasModalOpen] = useState(false)
  const [isTasinirModalOpen, setIsTasinirModalOpen] = useState(false)

  const [isEditingBarkod, setIsEditingBarkod] = useState(false)
  const [barkodError, setBarkodError] = useState('')

  const checkBarkod = async (barkod: string) => {
    if (!barkod) return
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Kalem WHERE barkod_id = ?',
        [barkod]
      )
      if (res.success && res.data && res.data.length > 0) {
        setBarkodError('Bu Barkod / ID sistemde zaten kayıtlı!')
      } else {
        setBarkodError('')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const [okasSearch, setOkasSearch] = useState('')
  const [tasinirSearch, setTasinirSearch] = useState('')

  const filteredOkas = okasKodList
    .filter(
      (k) =>
        k.kod.includes(okasSearch) ||
        (k.aciklama || '').toLowerCase().includes(okasSearch.toLowerCase())
    )
    .slice(0, 50)

  const filteredTasinir = tasinirKodList
    .filter(
      (k) =>
        k.tam_kod.includes(tasinirSearch) ||
        (k.aciklama || '').toLowerCase().includes(tasinirSearch.toLowerCase())
    )
    .slice(0, 50)

  const [isAiGeneratingOkas, setIsAiGeneratingOkas] = useState(false)

  const handleAiOkasSuggest = async () => {
    if (!formData.kalem_adi) {
      alert('Lütfen önce Mal/Hizmet/Yapım Adı alanını doldurunuz.')
      return
    }

    setIsAiGeneratingOkas(true)
    try {
      const prompt = `Aşağıdaki malzeme/hizmet için en uygun OKAS kodunu ve kısa bir açıklamasını öner. Yalnızca şu formatta cevap ver: "KOD: AÇIKLAMA". Örnek: "15.01.01.01: A4 Kağıt". Malzeme Adı: ${formData.kalem_adi}`
      const res = await window.api.aiGenerate({ prompt })

      if (res.success && res.data) {
        // Genellikle cevap "12.34.56.78: XYZ" formatında gelir, bunu parse edelim.
        const text = res.data.trim()
        const codeMatch = text.match(/^([\d.]+)/)
        if (codeMatch && codeMatch[1]) {
          setFormData({ ...formData, okas_kodu: codeMatch[1] })
          alert(`Yapay Zeka Önerisi:\n\n${text}`)
        } else {
          alert(
            `Yapay Zeka Önerisi:\n\n${text}\n\nTam olarak bir kod bulunamadı, lütfen manuel seçin.`
          )
        }
      } else {
        alert('AI Hatası: ' + (res.error || 'Bilinmeyen hata'))
      }
    } catch (err: any) {
      alert('AI İsteği sırasında hata oluştu: ' + err.message)
    } finally {
      setIsAiGeneratingOkas(false)
    }
  }

  const handleSave = async () => {
    if (!formData.kalem_adi || !formData.barkod_id) {
      alert('Lütfen zorunlu alanları (Adı, Kodu/Barkodu) doldurunuz.')
      return
    }

    if (barkodError) {
      alert('Barkod hatasını düzeltmeden kaydedemezsiniz!')
      return
    }

    try {
      await addKalem(formData)
      navigate({ to: '/malzemeler' })
    } catch (err) {
      alert('Kaydedilirken hata oluştu: ' + (err as Error).message)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="flex-none p-4 md:p-6 pb-0 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/malzemeler"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <PackageSearch className="text-primary" size={24} />
              Yeni Kayıt (Mal/Hizmet/Yapım İşi)
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sisteme yeni bir malzeme, hizmet veya yapım işi tanımı ekleyin
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => navigate({ to: '/malzemeler' })}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <Save size={18} />
              Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Kimlik Bilgileri */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <Barcode className="text-primary" size={20} />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Kimlik & Sınıflandırma
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Barkod / Benzersiz ID <span className="text-red-500">*</span>
                  </label>
                  {!isEditingBarkod ? (
                    <div
                      onClick={() => setIsEditingBarkod(true)}
                      className="cursor-pointer group flex items-center gap-2 py-2"
                      title="Değiştirmek için tıklayın"
                    >
                      <span
                        className={`font-mono text-lg tracking-wider ${barkodError ? 'text-red-600 font-bold' : 'text-slate-700 dark:text-slate-300 font-semibold'}`}
                      >
                        {formData.barkod_id}
                      </span>
                      <Edit2
                        size={14}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      autoFocus
                      value={formData.barkod_id || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, barkod_id: e.target.value })
                        setBarkodError('')
                      }}
                      onBlur={(e) => {
                        setIsEditingBarkod(false)
                        checkBarkod(e.target.value)
                      }}
                      className={`w-full px-3 py-2 bg-white border ${barkodError ? 'border-red-500' : 'border-slate-300'} rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-lg tracking-wider font-semibold shadow-inner`}
                    />
                  )}
                  {barkodError ? (
                    <p className="text-xs text-red-500 mt-0.5 font-medium">{barkodError}</p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-0.5 italic">
                      Değiştirmek için koda tıklayın.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Taşınır Kodu
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.tasinir_kodu || ''}
                      onChange={(e) => setFormData({ ...formData, tasinir_kodu: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Örn: 150.01.01.01"
                    />
                    <button
                      onClick={() => setIsTasinirModalOpen(true)}
                      className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 shrink-0 border border-slate-200"
                    >
                      <Search size={16} />
                      <span className="hidden sm:inline">Listeden Seç</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Mal/Hizmet/Yapım Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.kalem_adi || ''}
                    onChange={(e) => setFormData({ ...formData, kalem_adi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Örn: A4 Fotokopi Kağıdı 80gr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    OKAS Kodu
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.okas_kodu || ''}
                      onChange={(e) => setFormData({ ...formData, okas_kodu: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="OKAS Kodu giriniz veya seçiniz"
                    />
                    <button
                      onClick={() => setIsOkasModalOpen(true)}
                      className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 shrink-0 border border-slate-200"
                    >
                      <Search size={16} />
                      <span className="hidden sm:inline">Listeden Seç</span>
                    </button>
                    <button
                      onClick={handleAiOkasSuggest}
                      disabled={isAiGeneratingOkas}
                      title="Malzeme adına göre Yapay Zeka (AI) ile OKAS önerisi al"
                      className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-2 shrink-0 border border-purple-200 disabled:opacity-50"
                    >
                      {isAiGeneratingOkas ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Bot size={16} />
                      )}
                      <span className="hidden sm:inline">AI Önerisi</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Temel Özellikler */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <Database className="text-primary" size={20} />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Temel Özellikler & Birimler
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Türü
                  </label>
                  <select
                    value={formData.tipi || 'Mal'}
                    onChange={(e) => setFormData({ ...formData, tipi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Mal">Mal</option>
                    <option value="Hizmet, Personel">Hizmet, Personel</option>
                    <option value="Hizmet, Diğer">Hizmet, Diğer</option>
                    <option value="Yapım">Yapım İşi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Birim
                  </label>
                  <select
                    value={formData.birim || 'Adet'}
                    onChange={(e) => setFormData({ ...formData, birim: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {birimler
                      .filter((b) => b.aktif_mi)
                      .map((birim) => (
                        <option key={birim.id} value={birim.ad}>
                          {birim.ad}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    KDV Oranı (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.kdv_orani !== undefined ? formData.kdv_orani : 20}
                    onChange={(e) =>
                      setFormData({ ...formData, kdv_orani: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Özelliği
                  </label>
                  <textarea
                    value={formData.ozelligi || ''}
                    onChange={(e) => setFormData({ ...formData, ozelligi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[95px] resize-y"
                    placeholder="Teknik özellikleri, detayları..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Menşei
                  </label>
                  <select
                    value={formData.mensei || ''}
                    onChange={(e) => setFormData({ ...formData, mensei: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">(Belirtilmemiş)</option>
                    <option value="Yerli">Yerli</option>
                    <option value="İthal">İthal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Hizmet (Personel) Özel Alanlar */}
          {formData.tipi === 'Hizmet, Personel' && (
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800/30 overflow-hidden">
              <div className="px-6 py-4 border-b border-indigo-100 dark:border-indigo-800/30 flex items-center gap-2">
                <Activity className="text-indigo-600 dark:text-indigo-400" size={20} />
                <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  Personel Hizmeti Detayları
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Asgari Ücret Fark Oranı (%)
                  </label>
                  <input
                    type="number"
                    value={formData.personel_asgari_fark_oran || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personel_asgari_fark_oran: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Sadece personel ihalelerinde katsayı hesaplaması için
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selection Modals */}
      {isOkasModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
            style={{ maxHeight: '80vh' }}
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Search size={18} className="text-primary" /> OKAS Kodu Seçin
              </h3>
              <button
                onClick={() => setIsOkasModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                &times;
              </button>
            </div>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="OKAS Kodu veya açıklama ile ara..."
                  value={okasSearch}
                  onChange={(e) => setOkasSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 min-h-[300px]">
              {isOkasLoading ? (
                <div className="p-8 text-center text-slate-500">Yükleniyor...</div>
              ) : filteredOkas.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Aradığınız kriterlere uygun OKAS Kodu bulunamadı.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredOkas.map((k) => (
                    <button
                      key={k.id}
                      onClick={() => {
                        setFormData({ ...formData, okas_kodu: k.kod })
                        setIsOkasModalOpen(false)
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <span className="font-mono text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded shrink-0">
                        {k.kod}
                      </span>
                      <span className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                        {k.aciklama}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isTasinirModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
            style={{ maxHeight: '80vh' }}
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Search size={18} className="text-indigo-600 dark:text-indigo-400" /> Taşınır Kodu
                Seçin
              </h3>
              <button
                onClick={() => setIsTasinirModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                &times;
              </button>
            </div>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Hesap kodu (örn: 150.01) veya açıklama ile ara..."
                  value={tasinirSearch}
                  onChange={(e) => setTasinirSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 min-h-[300px]">
              {isTasinirLoading ? (
                <div className="p-8 text-center text-slate-500">Yükleniyor...</div>
              ) : filteredTasinir.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Aradığınız kriterlere uygun Taşınır Kodu bulunamadı.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTasinir.map((k) => (
                    <button
                      key={k.id}
                      onClick={() => {
                        setFormData({ ...formData, tasinir_kodu: k.tam_kod })
                        setIsTasinirModalOpen(false)
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <span className="font-mono text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-2.5 py-1 rounded shrink-0">
                        {k.tam_kod}
                      </span>
                      <span className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                        {k.aciklama}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
