import React, { useState } from 'react'
import { useBirimlerHooks, BirimInput, usePersonelList } from './birimler.hooks'
import { useAyarlarHooks } from '../ayarlar/ayarlar.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { LayoutGrid, Plus, Trash2, Edit2, ChevronDown, ChevronUp, Building2, Hash, Users, MapPin, Type, AlignLeft, User, PhoneCall, Building } from 'lucide-react'

import { Modal } from '../../components/ui/Modal'

const emptyBirim: BirimInput = {
  birim_adi: '', antet_ek_satir: '', ihtiyac_yeri_eki: '',
  sunum_makami: '', e_butce: '', say2000i: '', ayrintili_bilgi_personel: '', ilgili_personel_id: null
}

const Field = ({ label, field, form, handleChange, required, placeholder }: { label: string; field: keyof BirimInput; form: BirimInput; handleChange: (field: keyof BirimInput, value: string) => void; required?: boolean; placeholder?: string }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Input
      value={form[field] as string || ''}
      onChange={(e) => handleChange(field, e.target.value)}
      placeholder={placeholder || label}
      required={required}
      className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9"
    />
  </div>
)

export default function BirimlerScreen(): React.ReactNode {
  const { birimler, isLoadingBirimler, addBirim, updateBirim, deleteBirim } = useBirimlerHooks()
  const { personeller, isLoading: isLoadingPersonel } = usePersonelList()
  const { settings } = useAyarlarHooks()
  const [form, setForm] = useState<BirimInput>({ ...emptyBirim })
  const [showExtraFields, setShowExtraFields] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBirimId, setEditingBirimId] = useState<number | null>(null)

  const handleChange = (key: keyof BirimInput, value: string | number | null): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveBirim = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.birim_adi.trim()) return
    
    try {
      const dataToSave = { ...form }
      
      // If the user hasn't typed the full code and a prefix exists, append the prefix!
      if (settings?.institutionCode && form.e_butce && !form.e_butce.startsWith(settings.institutionCode)) {
        dataToSave.e_butce = `${settings.institutionCode}.${form.e_butce}`
      }
      if (settings?.eskiKurumsalKod && form.say2000i && !form.say2000i.startsWith(settings.eskiKurumsalKod)) {
        dataToSave.say2000i = `${settings.eskiKurumsalKod}${form.say2000i}`
      }

      if (editingBirimId) {
        await updateBirim({ id: editingBirimId, data: dataToSave })
      } else {
        await addBirim(dataToSave)
      }
      setForm({ ...emptyBirim })
      setShowExtraFields(false)
      setIsModalOpen(false)
      setEditingBirimId(null)
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) {
        alert('Bu birim zaten ekli!')
      } else {
        console.error(err)
        alert('Birim kaydedilirken hata oluştu!')
      }
    }
  }

  const handleEditClick = (birim: any) => {
    setForm({
      birim_adi: birim.birim_adi || '',
      antet_ek_satir: birim.antet_ek_satir || '',
      ihtiyac_yeri_eki: birim.ihtiyac_yeri_eki || '',
      sunum_makami: birim.sunum_makami || '',
      e_butce: birim.e_butce || '',
      say2000i: birim.say2000i || '',
      ayrintili_bilgi_personel: birim.ayrintili_bilgi_personel || '',
      ilgili_personel_id: birim.ilgili_personel_id || null
    })
    setEditingBirimId(birim.id)
    setShowExtraFields(true)
    setIsModalOpen(true)
  }

  const handleDeleteBirim = async (id: number): Promise<void> => {
    if (confirm('Bu birimi silmek istediğinize emin misiniz?')) {
      try {
        await deleteBirim(id)
      } catch (err) {
        alert('Silme sırasında hata oluştu!')
      }
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-blue-600" />
            Birim &amp; Müdürlük Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Kurumunuza ait idari birimleri ve müdürlükleri buradan tanımlayarak personellere atayabilirsiniz.
          </p>
        </div>
        <Button 
          onClick={() => {
            setForm({ ...emptyBirim })
            setEditingBirimId(null)
            setShowExtraFields(false)
            setIsModalOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-2 px-4 py-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Yeni Birim Ekle
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingBirimler ? (
            <div className="col-span-full text-sm text-slate-450 dark:text-slate-500 py-4 italic">Birimler yükleniyor...</div>
          ) : birimler.length === 0 ? (
            <div className="col-span-full text-sm text-slate-450 dark:text-slate-500 py-4 italic">Kayıtlı birim bulunmamaktadır.</div>
          ) : (
            birimler.map((birim) => {
              const personel = personeller.find(p => p.id === birim.ilgili_personel_id)
              const legacyPersonelText = birim.ayrintili_bilgi_personel
              
              return (
                <div
                  key={birim.id}
                  className="flex flex-col p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-700 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all bg-gradient-to-l from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900 pl-8">
                    <Button
                      title="Düzenle"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(birim)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      title="Sil"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBirim(birim.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Card Header */}
                  <div className="flex items-start gap-3 mb-4 pr-16">
                    <div className="w-10 h-10 shrink-0 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 leading-tight mb-1">
                        {birim.birim_adi}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {birim.e_butce && (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/50" title="Yeni Kurumsal Kod (e-Bütçe)">
                            <Hash className="w-3 h-3" />
                            {birim.e_butce}
                          </span>
                        )}
                        {birim.say2000i && (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700" title="Eski Kurumsal Kod (Say2000i)">
                            <Hash className="w-3 h-3" />
                            {birim.say2000i}
                          </span>
                        )}
                        {birim.personel_sayisi !== undefined && birim.personel_sayisi > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-md">
                            <Users className="w-3 h-3" />
                            {birim.personel_sayisi} Personel
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    {birim.sunum_makami && (
                      <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400 col-span-full">
                        <AlignLeft className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">Sunum Makamı:</span>
                          <span className="line-clamp-2">{birim.sunum_makami}</span>
                        </div>
                      </div>
                    )}
                    
                    {birim.antet_ek_satir && (
                      <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <Type className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Antet Ek Satır</span>
                          <span className="line-clamp-2 leading-relaxed">{birim.antet_ek_satir}</span>
                        </div>
                      </div>
                    )}
                    
                    {birim.ihtiyac_yeri_eki && (
                      <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">İhtiyaç Yeri</span>
                          <span className="line-clamp-2 leading-relaxed">{birim.ihtiyac_yeri_eki}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer (Personel) */}
                  {(personel || legacyPersonelText) && (
                    <div className="mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 -mx-5 -mb-5 px-5 py-3">
                      <User className="w-4 h-4 text-blue-500 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-0.5">İlgili Personel</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{personel ? personel.ad_soyad : legacyPersonelText}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingBirimId(null)
        }}
        title={editingBirimId ? "Birimi Düzenle" : "Yeni Birim Tanımla"}
        description={editingBirimId ? "İdari birim bilgilerini güncelleyin." : "Kurumunuza ait idari birim veya müdürlük ekleyin."}
      >
        <form onSubmit={handleSaveBirim} className="space-y-4">
          <Field label="Birim / Müdürlük Adı" field="birim_adi" form={form} handleChange={handleChange} required placeholder="Örn: Fen İşleri Müdürlüğü" />

          <button
            type="button"
            onClick={() => setShowExtraFields(!showExtraFields)}
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold mt-2 cursor-pointer w-full justify-center bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg transition-colors"
          >
            {showExtraFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showExtraFields ? 'Ek Bilgileri Gizle' : 'Antet, Kod & Sunum Bilgileri Göster'}
          </button>

          {showExtraFields && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Kurumsal Kod (e-Bütçe)
                  </label>
                  <div className="flex">
                    {settings?.institutionCode && (
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs font-mono">
                        {settings.institutionCode}.
                      </span>
                    )}
                    <input
                      type="text"
                      value={form.e_butce as string || ''}
                      onChange={(e) => handleChange('e_butce', e.target.value)}
                      placeholder="Birim Kodu (Örn: 03)"
                      className={`flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 ${settings?.institutionCode ? 'rounded-r-xl' : 'rounded-xl'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Eski Kurumsal Kod (Say2000i)
                  </label>
                  <div className="flex">
                    {settings?.eskiKurumsalKod && (
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs font-mono">
                        {settings.eskiKurumsalKod}
                      </span>
                    )}
                    <input
                      type="text"
                      value={form.say2000i as string || ''}
                      onChange={(e) => handleChange('say2000i', e.target.value)}
                      placeholder="Birim Kodu (Örn: 01)"
                      className={`flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 ${settings?.eskiKurumsalKod ? 'rounded-r-xl' : 'rounded-xl'}`}
                    />
                  </div>
                </div>
              </div>
              
              <Field label="Antet Ek Satır" field="antet_ek_satir" form={form} handleChange={handleChange} placeholder="Antet yazısında ek satır" />
              <Field label="İhtiyaç Yeri Eki" field="ihtiyac_yeri_eki" form={form} handleChange={handleChange} placeholder="İhtiyaç yeri ek bilgisi" />
              <Field label="Sunum Makamı" field="sunum_makami" form={form} handleChange={handleChange} placeholder="Sunulacak makam" />
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  İlgili Personel (Ayrıntılı Bilgi)
                </label>
                <select
                  value={form.ilgili_personel_id || ''}
                  onChange={(e) => handleChange('ilgili_personel_id', e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm py-2 h-10 rounded-xl px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  disabled={isLoadingPersonel}
                >
                  <option value="">-- Personel Seçiniz --</option>
                  {personeller.map(p => (
                    <option key={p.id} value={p.id}>{p.ad_soyad}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <Button type="button" variant="outline" onClick={() => {
              setIsModalOpen(false)
              setEditingBirimId(null)
            }}>
              İptal
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-md">
              {editingBirimId ? "Güncelle" : "Birimi Kaydet"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
