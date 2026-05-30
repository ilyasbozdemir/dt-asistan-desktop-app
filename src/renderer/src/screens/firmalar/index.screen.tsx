import React, { useState } from 'react'
import { useFirmalarHooks, FirmaInput } from './firmalar.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Building2, Plus, Trash2, Search, ChevronDown, ChevronUp, MapPin } from 'lucide-react'

const emptyFirma: FirmaInput = {
  firma_kodu: '', unvan: '', ilgili_adi: '', uyrugu: 'T.C.',
  istigal_konusu: '', adres: '', ilce: '', posta_kodu: '', il: '',
  telefon: '', faks: '', email: '', web_adresi: '',
  banka_adi: '', sube_kodu_adi: '', hesap_no: '',
  tc_kimlik_no: '', dogum_tarihi: '', vergi_dairesi: '', vergi_no: ''
}

const Field = ({ label, field, form, handleChange, required, placeholder }: { label: string; field: keyof FirmaInput; form: FirmaInput; handleChange: (field: keyof FirmaInput, value: string) => void; required?: boolean; placeholder?: string }) => (
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
  const { firmalar, isLoadingFirmalar, addFirma, deleteFirma } = useFirmalarHooks()
  const [form, setForm] = useState<FirmaInput>({ ...emptyFirma })
  const [searchQuery, setSearchQuery] = useState('')
  const [showExtraFields, setShowExtraFields] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleChange = (key: keyof FirmaInput, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleAdd = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.unvan.trim()) return
    try {
      await addFirma(form)
      setForm({ ...emptyFirma })
      setShowExtraFields(false)
      setIsModalOpen(false)
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) {
        alert('Bu firma zaten kayıtlı!')
      } else {
        alert('Firma eklenirken hata oluştu!')
      }
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
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

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      {/* BAŞLIK */}
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <Building2 className="w-8 h-8 text-blue-600" />
            İstekli Firma Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Doğrudan temin süreçlerinde kullanılacak firma ve tedarikçi havuzunu yönetin.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right border-r border-slate-200 dark:border-slate-800 pr-6 hidden sm:block">
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{firmalar.length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Kayıtlı Firma</div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md flex items-center px-4 py-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Yeni Firma Ekle
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Kayıtlı Firmalar</h3>
          <div className="relative w-72">
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
            <div className="col-span-full p-8 text-center text-slate-450 dark:text-slate-500 animate-pulse italic">Firmalar yükleniyor...</div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full p-16 flex flex-col items-center justify-center text-slate-450 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <Building2 className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Firma Bulunamadı</h3>
              <p className="text-xs mt-1 text-slate-500">
                {searchQuery ? 'Arama kriterlerinize uygun firma yok.' : 'Henüz sisteme eklenmiş bir firma bulunmuyor.'}
              </p>
            </div>
          ) : (
            filtered.map((firma) => (
              <div
                key={firma.id}
                className="flex flex-col p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors group relative"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    title="Sil"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(firma.id)}
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
        title="Yeni Firma Ekle"
        description="Tedarikçi firma bilgilerini sisteme kaydedin."
        className="max-w-2xl"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Firma Kodu" field="firma_kodu" form={form} handleChange={handleChange} placeholder="Örn: FRM-001" />
            <Field label="Firma Ünvanı" field="unvan" form={form} handleChange={handleChange} required placeholder="Firma ticari ünvanı" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="İlgili Kişi" field="ilgili_adi" form={form} handleChange={handleChange} />
            <Field label="Uyruğu" field="uyrugu" form={form} handleChange={handleChange} />
          </div>
          <Field label="İştigal Konusu" field="istigal_konusu" form={form} handleChange={handleChange} placeholder="Yapı malzemesi, kırtasiye vb." />

          <button
            type="button"
            onClick={() => setShowExtraFields(!showExtraFields)}
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold mt-2 cursor-pointer w-full justify-center bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg transition-colors"
          >
            {showExtraFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showExtraFields ? 'Ek Bilgileri Gizle' : 'Adres, Banka & Vergi Bilgileri Göster'}
          </button>

          {showExtraFields && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <Field label="Adres" field="adres" form={form} handleChange={handleChange} />
              <div className="grid grid-cols-3 gap-4">
                <Field label="İlçe" field="ilce" form={form} handleChange={handleChange} />
                <Field label="Posta Kodu" field="posta_kodu" form={form} handleChange={handleChange} />
                <Field label="İl" field="il" form={form} handleChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Telefon" field="telefon" form={form} handleChange={handleChange} />
                <Field label="Faks" field="faks" form={form} handleChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="E-mail" field="email" form={form} handleChange={handleChange} />
                <Field label="Web Adresi" field="web_adresi" form={form} handleChange={handleChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Banka Adı" field="banka_adi" form={form} handleChange={handleChange} />
                <Field label="Şube Kodu / Adı" field="sube_kodu_adi" form={form} handleChange={handleChange} />
              </div>
              <Field label="Hesap No" field="hesap_no" form={form} handleChange={handleChange} />

              <div className="grid grid-cols-2 gap-4">
                <Field label="TC Kimlik No" field="tc_kimlik_no" form={form} handleChange={handleChange} />
                <Field label="Doğum Tarihi" field="dogum_tarihi" form={form} handleChange={handleChange} placeholder="GG.AA.YYYY" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Vergi Dairesi" field="vergi_dairesi" form={form} handleChange={handleChange} />
                <Field label="Vergi No" field="vergi_no" form={form} handleChange={handleChange} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-md">
              Firmayı Kaydet
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
