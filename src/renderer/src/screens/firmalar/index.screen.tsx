import React, { useState } from 'react'
import { useFirmalarHooks, FirmaInput } from './firmalar.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import {
  Building2,
  Plus,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  Edit2,
  MapPin,
  Phone,
  Landmark,
  FileText,
  User,
  ArrowLeft
} from 'lucide-react'

const emptyFirma: FirmaInput = {
  firma_kodu: '',
  unvan: '',
  ilgili_adi: '',
  uyrugu: 'T.C.',
  istigal_konusu: '',
  adres: '',
  ilce: '',
  posta_kodu: '',
  il: '',
  telefon: '',
  faks: '',
  email: '',
  web_adresi: '',
  banka_adi: '',
  sube_kodu_adi: '',
  hesap_no: '',
  tc_kimlik_no: '',
  dogum_tarihi: '',
  vergi_dairesi: '',
  vergi_no: ''
}

const Field = ({
  label,
  field,
  form,
  handleChange,
  required,
  placeholder
}: {
  label: string
  field: keyof FirmaInput
  form: FirmaInput
  handleChange: (field: keyof FirmaInput, value: string) => void
  required?: boolean
  placeholder?: string
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Input
      value={form[field] as string}
      onChange={(e) => handleChange(field, e.target.value)}
      placeholder={placeholder || label}
      required={required}
      className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9"
    />
  </div>
)

export default function FirmalarScreen(): React.JSX.Element {
  const { firmalar, isLoadingFirmalar, addFirma, updateFirma, deleteFirma } = useFirmalarHooks()
  const [form, setForm] = useState<FirmaInput>({ ...emptyFirma })
  const [searchQuery, setSearchQuery] = useState('')
  const [showExtraFields, setShowExtraFields] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [viewingFirma, setViewingFirma] = useState<any | null>(null)

  const openAddModal = () => {
    setForm({ ...emptyFirma })
    setEditingId(null)
    setShowExtraFields(false)
    setIsModalOpen(true)
  }

  const openEditModal = (e: React.MouseEvent, firma: any) => {
    e.stopPropagation()
    const { id, aktif_mi, created_at, ...editableData } = firma
    setForm(editableData)
    setEditingId(id)
    setShowExtraFields(false)
    setIsModalOpen(true)
  }

  const handleViewClick = (firma: any) => {
    setViewingFirma(firma)
  }

  const handleChange = (key: keyof FirmaInput, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.unvan.trim()) return

    // Duplicate kontrolleri (addFirma ve updateFirma hook'u içinde de var ama UX için önden verebiliriz,
    // Ancak hook'taki mesajları kullanmak daha temiz olduğu için burada basit kontroller yapabiliriz,
    // Veya direkt hook'a bırakabiliriz. Şimdilik hook'a bırakıyorum ki id kontrolleri doğru çalışsın.)

    try {
      if (editingId) {
        await updateFirma({ id: editingId, data: form })
      } else {
        await addFirma(form)
      }
      setForm({ ...emptyFirma })
      setEditingId(null)
      setShowExtraFields(false)
      setIsModalOpen(false)
    } catch (err: any) {
      alert(err.message || 'İşlem sırasında hata oluştu!')
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: number): Promise<void> => {
    e.stopPropagation()
    if (confirm('Bu firmayı silmek istediğinize emin misiniz?')) {
      try {
        await deleteFirma(id)
      } catch {
        alert('Silme sırasında hata oluştu!')
      }
    }
  }

  const filtered = firmalar.filter((f) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      f.unvan?.toLowerCase().includes(q) ||
      f.firma_kodu?.toLowerCase().includes(q) ||
      f.vergi_no?.toLowerCase().includes(q) ||
      f.il?.toLowerCase().includes(q)
    )
  })

  if (viewingFirma) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
        <Button
          variant="ghost"
          onClick={() => setViewingFirma(null)}
          className="w-fit mb-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Listeye Geri Dön
        </Button>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          {/* Header Section */}
          <div className="flex items-start gap-5 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold shadow-sm shrink-0 border border-blue-200 dark:border-blue-800">
              <Building2 className="w-10 h-10" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {viewingFirma.firma_kodu && (
                  <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100/20 dark:border-blue-900/10 px-2.5 py-1 rounded">
                    {viewingFirma.firma_kodu}
                  </span>
                )}
                {viewingFirma.uyrugu && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded uppercase tracking-wider">
                    {viewingFirma.uyrugu}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2">
                {viewingFirma.unvan}
              </h2>
              {viewingFirma.istigal_konusu && (
                <div className="text-base text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-500">İştigal:</span>{' '}
                  {viewingFirma.istigal_konusu}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sol Kolon: İletişim */}
            <div className="space-y-5">
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Phone className="w-5 h-5 text-slate-400" /> İletişim & Adres
              </h4>

              <div className="space-y-4">
                {(viewingFirma.telefon || viewingFirma.faks) && (
                  <div className="flex flex-col gap-1.5 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Telefon / Faks
                    </span>
                    <div className="text-base text-slate-800 dark:text-slate-200 font-medium">
                      {viewingFirma.telefon && (
                        <span className="mr-4">📞 {viewingFirma.telefon}</span>
                      )}
                      {viewingFirma.faks && <span>📠 {viewingFirma.faks}</span>}
                    </div>
                  </div>
                )}

                {(viewingFirma.email || viewingFirma.web_adresi) && (
                  <div className="flex flex-col gap-1.5 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Dijital İletişim
                    </span>
                    <div className="text-base text-slate-800 dark:text-slate-200 font-medium">
                      {viewingFirma.email && <div className="mb-1">✉️ {viewingFirma.email}</div>}
                      {viewingFirma.web_adresi && (
                        <div>
                          🌐{' '}
                          <a
                            href={
                              viewingFirma.web_adresi.startsWith('http')
                                ? viewingFirma.web_adresi
                                : `https://${viewingFirma.web_adresi}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {viewingFirma.web_adresi}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Adres Bilgileri
                  </span>
                  <div className="text-base text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {viewingFirma.adres ? (
                      <div className="mb-2.5 font-medium leading-relaxed">{viewingFirma.adres}</div>
                    ) : (
                      <div className="text-slate-400 italic mb-2.5">Adres girilmemiş.</div>
                    )}
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {viewingFirma.ilce && <span>{viewingFirma.ilce}</span>}
                      {viewingFirma.ilce && viewingFirma.il && <span>/</span>}
                      {viewingFirma.il && <span>{viewingFirma.il}</span>}
                      {viewingFirma.posta_kodu && (
                        <span className="ml-auto text-slate-400 font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
                          {viewingFirma.posta_kodu}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {viewingFirma.ilgili_adi && (
                  <div className="flex flex-col gap-1.5 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4" /> İlgili Kişi
                    </span>
                    <div className="text-base text-slate-800 dark:text-slate-200 font-bold">
                      {viewingFirma.ilgili_adi}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sağ Kolon: Banka & Vergi */}
            <div className="space-y-5">
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Landmark className="w-5 h-5 text-slate-400" /> Finansal & Resmi Bilgiler
              </h4>

              <div className="space-y-4">
                <div className="flex flex-col gap-2 bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <span className="text-[11px] font-bold text-amber-600/70 dark:text-amber-500/70 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Vergi Bilgileri
                  </span>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Vergi Dairesi</div>
                      <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.vergi_dairesi || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Vergi No</div>
                      <div className="text-base font-mono font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.vergi_no || '-'}
                      </div>
                    </div>
                    <div className="col-span-2 pt-3 border-t border-amber-200/50 dark:border-amber-800/50 mt-1">
                      <div className="text-xs text-slate-500 mb-1">TC Kimlik No</div>
                      <div className="text-base font-mono font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.tc_kimlik_no || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[11px] font-bold text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-wider flex items-center gap-1.5">
                    <Landmark className="w-4 h-4" /> Banka Bilgileri
                  </span>
                  <div className="space-y-4 mt-2">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Banka Adı</div>
                      <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.banka_adi || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Şube</div>
                      <div className="text-base font-medium text-slate-800 dark:text-slate-200">
                        {viewingFirma.sube_kodu_adi || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">IBAN / Hesap No</div>
                      <div className="text-base font-mono font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.hesap_no || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      {/* BAŞLIK */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <Building2 className="w-8 h-8 text-blue-600" />
            İstekli Firma Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Doğrudan temin süreçlerinde kullanılacak firma ve tedarikçi havuzunu yönetin.
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <div className="text-right border-r border-slate-200 dark:border-slate-800 pr-6 hidden sm:block">
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {firmalar.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Kayıtlı Firma
            </div>
          </div>
          <Button
            onClick={openAddModal}
            className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md flex items-center px-4 py-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Yeni Firma Ekle
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Kayıtlı Firmalar</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Firma ünvanı, vergi no, kod veya şehir ara..."
              className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-2 h-9 rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoadingFirmalar ? (
            <div className="col-span-full p-8 text-center text-slate-450 dark:text-slate-500 animate-pulse italic">
              Firmalar yükleniyor...
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full p-16 flex flex-col items-center justify-center text-slate-450 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <Building2 className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Firma Bulunamadı
              </h3>
              <p className="text-xs mt-1 text-slate-500">
                {searchQuery
                  ? 'Arama kriterlerinize uygun firma yok.'
                  : 'Henüz sisteme eklenmiş bir firma bulunmuyor.'}
              </p>
            </div>
          ) : (
            filtered.map((firma) => (
              <div
                key={firma.id}
                onClick={() => handleViewClick(firma)}
                className="flex flex-col p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors group relative cursor-pointer"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    title="Düzenle"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => openEditModal(e, firma)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    title="Sil"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(e, firma.id)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-2 pr-8">
                  {firma.firma_kodu && (
                    <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100/20 dark:border-blue-900/10 px-1.5 py-0.5 rounded">
                      {firma.firma_kodu}
                    </span>
                  )}
                  {firma.il && (
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {firma.il}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 leading-snug pr-8 line-clamp-2">
                  {firma.unvan}
                </h4>

                <div className="mt-auto border-t border-slate-200/60 dark:border-slate-800/60 pt-3 flex flex-col gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {firma.telefon && (
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="text-xs shrink-0">📞</span> {firma.telefon}
                    </span>
                  )}
                  {firma.email && (
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="text-xs shrink-0">✉️</span> {firma.email}
                    </span>
                  )}
                  {firma.vergi_no && (
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="text-xs shrink-0">🏛️</span> VN: {firma.vergi_no}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Firma Düzenle' : 'Yeni Firma Ekle'}
        description={
          editingId
            ? 'Firma bilgilerini güncelleyin.'
            : 'Tedarikçi firma bilgilerini sisteme kaydedin.'
        }
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Firma Kodu"
              field="firma_kodu"
              form={form}
              handleChange={handleChange}
              placeholder="Örn: FRM-001"
            />
            <Field
              label="Firma Ünvanı"
              field="unvan"
              form={form}
              handleChange={handleChange}
              required
              placeholder="Firma ticari ünvanı"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="İlgili Kişi" field="ilgili_adi" form={form} handleChange={handleChange} />
            <Field label="Uyruğu" field="uyrugu" form={form} handleChange={handleChange} />
          </div>
          <Field
            label="İştigal Konusu"
            field="istigal_konusu"
            form={form}
            handleChange={handleChange}
            placeholder="Yapı malzemesi, kırtasiye vb."
          />

          <button
            type="button"
            onClick={() => setShowExtraFields(!showExtraFields)}
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold mt-2 cursor-pointer w-full justify-center bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg transition-colors"
          >
            {showExtraFields ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            {showExtraFields ? 'Ek Bilgileri Gizle' : 'Adres, Banka & Vergi Bilgileri Göster'}
          </button>

          {showExtraFields && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <Field label="Adres" field="adres" form={form} handleChange={handleChange} />
              <div className="grid grid-cols-3 gap-4">
                <Field label="İlçe" field="ilce" form={form} handleChange={handleChange} />
                <Field
                  label="Posta Kodu"
                  field="posta_kodu"
                  form={form}
                  handleChange={handleChange}
                />
                <Field label="İl" field="il" form={form} handleChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Telefon" field="telefon" form={form} handleChange={handleChange} />
                <Field label="Faks" field="faks" form={form} handleChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="E-mail" field="email" form={form} handleChange={handleChange} />
                <Field
                  label="Web Adresi"
                  field="web_adresi"
                  form={form}
                  handleChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Banka Adı"
                  field="banka_adi"
                  form={form}
                  handleChange={handleChange}
                />
                <Field
                  label="Şube Kodu / Adı"
                  field="sube_kodu_adi"
                  form={form}
                  handleChange={handleChange}
                />
              </div>
              <Field label="Hesap No" field="hesap_no" form={form} handleChange={handleChange} />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="TC Kimlik No"
                  field="tc_kimlik_no"
                  form={form}
                  handleChange={handleChange}
                />
                <Field
                  label="Doğum Tarihi"
                  field="dogum_tarihi"
                  form={form}
                  handleChange={handleChange}
                  placeholder="GG.AA.YYYY"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Vergi Dairesi"
                  field="vergi_dairesi"
                  form={form}
                  handleChange={handleChange}
                />
                <Field label="Vergi No" field="vergi_no" form={form} handleChange={handleChange} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-md">
              {editingId ? 'Güncelle' : 'Firmayı Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
