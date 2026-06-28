import React, { useState } from 'react'
import { useBirimlerHooks, BirimInput, usePersonelList } from './birimler.hooks'
import { useAyarlarHooks } from '../ayarlar/ayarlar.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import {
  LayoutGrid,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Hash,
  Users,
  MapPin,
  Type,
  AlignLeft,
  User,
  Building,
  Calendar,
  Info,
  ArrowLeft,
  X,
  HelpCircle,
  ExternalLink
} from 'lucide-react'

import { Modal } from '../../components/ui/Modal'

const emptyBirim: BirimInput = {
  birim_adi: '',
  antet_ek_satir: '',
  ihtiyac_yeri_eki: '',
  sunum_makami: '',
  e_butce: '',
  say2000i: '',
  dtvt_kodu: '',
  detsis_kodu: '',
  muhasebe_kodu: '',
  muhasebe_adi: '',
  harcama_kodu: '',
  harcama_adi: '',
  ayrintili_bilgi_personel: '',
  ilgili_personel_id: null
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
  field: keyof BirimInput
  form: BirimInput
  handleChange: (field: keyof BirimInput, value: string) => void
  required?: boolean
  placeholder?: string
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Input
      value={(form[field] as string) || ''}
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
  const { settings } = useAyarlarHooks() as { settings: Record<string, string> }
  const [form, setForm] = useState<BirimInput>({ ...emptyBirim })
  const [showExtraFields, setShowExtraFields] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBirimId, setEditingBirimId] = useState<number | null>(null)

  const [viewingBirim, setViewingBirim] = useState<any | null>(null)

  const [ihtiyacYeriList, setIhtiyacYeriList] = useState<string[]>([''])

  const isMuhasebe =
    form.birim_adi.toLowerCase().includes('muhasebe') ||
    form.birim_adi.toLowerCase().includes('mali') ||
    form.birim_adi.toLowerCase().includes('harcama')

  // Placeholder for kurumsalKodlar as per instruction logic
  const handleChange = (key: keyof BirimInput, value: string | number | null): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.birim_adi.trim()) return

    const finalIhtiyacYeri = ihtiyacYeriList.filter((v) => v.trim() !== '').join('\n')
    const submitData = { ...form, ihtiyac_yeri_eki: finalIhtiyacYeri }

    try {
      if (editingBirimId) {
        await updateBirim({ id: editingBirimId, data: submitData })
      } else {
        await addBirim(submitData)
      }
      closeModal()
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) {
        alert('Bu birim zaten ekli!')
      } else {
        console.error(err)
        alert('Birim kaydedilirken hata oluştu!')
      }
    }
  }

  const openModal = () => {
    setForm({ ...emptyBirim })
    setIhtiyacYeriList([''])
    setEditingBirimId(null)
    setShowExtraFields(false)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBirimId(null)
    setIhtiyacYeriList([''])
  }

  const handleEditClick = (e: React.MouseEvent, birim: any) => {
    e.stopPropagation()
    setForm({
      birim_adi: birim.birim_adi || '',
      antet_ek_satir: birim.antet_ek_satir || '',
      ihtiyac_yeri_eki: birim.ihtiyac_yeri_eki || '',
      sunum_makami: birim.sunum_makami || '',
      e_butce: birim.e_butce || '',
      say2000i: birim.say2000i || '',
      dtvt_kodu: birim.dtvt_kodu || '',
      detsis_kodu: birim.detsis_kodu || '',
      muhasebe_kodu: birim.muhasebe_kodu || '',
      muhasebe_adi: birim.muhasebe_adi || '',
      harcama_kodu: birim.harcama_kodu || '',
      harcama_adi: birim.harcama_adi || '',
      ayrintili_bilgi_personel: birim.ayrintili_bilgi_personel || '',
      ilgili_personel_id: birim.ilgili_personel_id || null
    })
    setIhtiyacYeriList(birim.ihtiyac_yeri_eki ? birim.ihtiyac_yeri_eki.split('\n') : [''])
    setEditingBirimId(birim.id)
    setShowExtraFields(true)
    setIsModalOpen(true)
  }

  const handleViewClick = (birim: any) => {
    setViewingBirim(birim)
  }

  const handleDeleteBirim = async (e: React.MouseEvent, id: number): Promise<void> => {
    e.stopPropagation()
    if (confirm('Bu birimi silmek istediğinize emin misiniz?')) {
      try {
        await deleteBirim(id)
      } catch (err) {
        alert('Silme sırasında hata oluştu!')
      }
    }
  }

  // EĞER DETAY EKRANINDAYSAK, LİSTEYİ GÖSTERME
  if (viewingBirim) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
        <Button
          variant="ghost"
          onClick={() => setViewingBirim(null)}
          className="w-fit mb-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Listeye Geri Dön
        </Button>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-5 bg-blue-50/50 dark:bg-blue-950/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/50 mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-blue-200 dark:border-blue-800">
              <Building className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                {viewingBirim.birim_adi}
              </h2>
              <div className="text-sm text-slate-500 flex gap-4">
                {viewingBirim.personel_sayisi !== undefined && (
                  <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <Users className="w-4 h-4 text-blue-500" /> {viewingBirim.personel_sayisi}{' '}
                    Personel
                  </span>
                )}
                {viewingBirim.created_at &&
                  new Date(viewingBirim.created_at).getFullYear() > 2000 && (
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-400" />{' '}
                      {new Date(viewingBirim.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <Hash className="w-4 h-4 text-slate-400" /> e-Bütçe Kodu
              </span>
              <span className="font-mono text-base text-slate-800 dark:text-slate-200 font-semibold">
                {viewingBirim.e_butce || '-'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <Hash className="w-4 h-4 text-slate-400" /> Say2000i Kodu
              </span>
              <span className="font-mono text-base text-slate-800 dark:text-slate-200 font-semibold">
                {viewingBirim.say2000i || '-'}
              </span>
            </div>

            <div className="p-4 bg-slate-55 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <Hash className="w-4 h-4 text-slate-400" /> DETSİS / DTVT Kodu
              </span>
              <span className="font-mono text-base text-slate-800 dark:text-slate-200 font-semibold">
                {viewingBirim.detsis_kodu || viewingBirim.dtvt_kodu || '-'}
              </span>
            </div>

            {viewingBirim.muhasebe_kodu && (
              <div className="p-4 bg-slate-55 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <Hash className="w-4 h-4 text-slate-400" /> Muhasebe Birim Kodu &amp; Adı
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-base text-slate-800 dark:text-slate-200 font-semibold">
                    {viewingBirim.muhasebe_kodu}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {viewingBirim.muhasebe_adi || '-'}
                  </span>
                </div>
              </div>
            )}

            {viewingBirim.harcama_kodu && (
              <div className="p-4 bg-slate-55 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <Hash className="w-4 h-4 text-slate-400" /> Harcama Birim Kodu &amp; Adı
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-base text-slate-800 dark:text-slate-200 font-semibold">
                    {viewingBirim.harcama_kodu}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {viewingBirim.harcama_adi || '-'}
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <AlignLeft className="w-4 h-4 text-slate-400" /> Sunum Makamı
              </span>
              <span className="text-sm text-slate-800 dark:text-slate-200">
                {viewingBirim.sunum_makami || '-'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <Type className="w-4 h-4 text-slate-400" /> Antet Ek Satır
              </span>
              <span className="text-sm text-slate-800 dark:text-slate-200">
                {viewingBirim.antet_ek_satir || '-'}
              </span>
            </div>

            {(viewingBirim.ilgili_personel_id || viewingBirim.ayrintili_bilgi_personel) && (
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-wider mb-2">
                  <User className="w-4 h-4 text-emerald-500" /> İlgili Personel
                </span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {personeller.find((p) => p.id === viewingBirim.ilgili_personel_id)?.ad_soyad ||
                    viewingBirim.ayrintili_bilgi_personel}
                </span>
              </div>
            )}

            {viewingBirim.ihtiyac_yeri_eki && (
              <div className="col-span-full p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600/70 dark:text-amber-500/70 uppercase tracking-wider mb-3">
                  <MapPin className="w-4 h-4 text-amber-500" /> İhtiyaç Yerleri
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {viewingBirim.ihtiyac_yeri_eki
                    .split('\n')
                    .filter((y: string) => y.trim())
                    .map((yer: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-amber-200/50 dark:border-amber-800/50 shadow-sm"
                      >
                        <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">
                          {yer}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
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
            Kurumunuza ait idari birimleri ve müdürlükleri buradan tanımlayarak personellere
            atayabilirsiniz.
          </p>
        </div>
        <Button
          onClick={openModal}
          className="bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-2 px-4 py-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Yeni Birim Ekle
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingBirimler ? (
            <div className="col-span-full text-sm text-slate-450 dark:text-slate-500 py-4 italic">
              Birimler yükleniyor...
            </div>
          ) : birimler.length === 0 ? (
            <div className="col-span-full text-sm text-slate-450 dark:text-slate-500 py-4 italic">
              Kayıtlı birim bulunmamaktadır.
            </div>
          ) : (
            birimler.map((birim) => {
              const personel = personeller.find((p) => p.id === birim.ilgili_personel_id)
              const legacyPersonelText = birim.ayrintili_bilgi_personel

              return (
                <div
                  key={birim.id}
                  onClick={() => handleViewClick(birim)}
                  className="flex flex-col p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-700 transition-all group relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 right-0 p-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all bg-gradient-to-l from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900 pl-8">
                    <Button
                      title="Düzenle"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditClick(e, birim)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      title="Sil"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteBirim(e, birim.id)}
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
                          <span
                            className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/50"
                            title="e-Bütçe Kodu"
                          >
                            <Hash className="w-3 h-3" />
                            {birim.e_butce}
                          </span>
                        )}
                        {birim.say2000i && (
                          <span
                            className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"
                            title="Say2000i Kodu"
                          >
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
                          <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">
                            Sunum Makamı:
                          </span>
                          <span className="line-clamp-2">{birim.sunum_makami}</span>
                        </div>
                      </div>
                    )}
                    {(birim.detsis_kodu || birim.dtvt_kodu) && (
                      <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400 col-span-full">
                        <Building className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">
                            DETSİS Kodu:
                          </span>
                          <span className="font-mono">{birim.detsis_kodu || birim.dtvt_kodu}</span>
                        </div>
                      </div>
                    )}
                    {birim.muhasebe_kodu && (
                      <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400 col-span-full">
                        <Hash className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">
                            Muhasebe:
                          </span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">
                            {birim.muhasebe_kodu}
                          </span>
                          {birim.muhasebe_adi && (
                            <span className="text-slate-500 dark:text-slate-400 ml-1">
                              ({birim.muhasebe_adi})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {birim.harcama_kodu && (
                      <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400 col-span-full">
                        <Hash className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">
                            Harcama:
                          </span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">
                            {birim.harcama_kodu}
                          </span>
                          {birim.harcama_adi && (
                            <span className="text-slate-500 dark:text-slate-400 ml-1">
                              ({birim.harcama_adi})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {birim.antet_ek_satir && (
                      <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <Type className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                            Antet Ek Satır
                          </span>
                          <span className="line-clamp-2 leading-relaxed">
                            {birim.antet_ek_satir}
                          </span>
                        </div>
                      </div>
                    )}

                    {birim.ihtiyac_yeri_eki && (
                      <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                            İhtiyaç Yeri
                          </span>
                          <span className="line-clamp-2 leading-relaxed">
                            {birim.ihtiyac_yeri_eki}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer (Personel) */}
                  {(personel || legacyPersonelText) && (
                    <div className="mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 -mx-5 -mb-5 px-5 py-3">
                      <User className="w-4 h-4 text-blue-500 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-0.5">
                          İlgili Personel
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {personel ? personel.ad_soyad : legacyPersonelText}
                        </span>
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
        onClose={closeModal}
        title={editingBirimId ? 'Birimi Düzenle' : 'Yeni Birim Tanımla'}
        description={
          editingBirimId
            ? 'İdari birim bilgilerini güncelleyin.'
            : 'Kurumunuza ait idari birim veya müdürlük ekleyin.'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Birim / Müdürlük Adı"
            field="birim_adi"
            form={form}
            handleChange={handleChange}
            required
            placeholder="Örn: Fen İşleri Müdürlüğü"
          />

          {isMuhasebe && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="col-span-full">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Mali / Muhasebe birimi tespit edildi. Lütfen finansal kodları giriniz:
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  e-Bütçe Kodu
                  <span title="Kurumunuzun e-Bütçe sistemindeki ön ek kodudur (Örn: 38.xx.xx)">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-500 cursor-help" />
                  </span>
                </label>
                <div className="flex">
                  {settings?.eButceKodu && (
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs font-mono">
                      {settings.eButceKodu}.
                    </span>
                  )}
                  <input
                    type="text"
                    value={(form.e_butce as string) || ''}
                    onChange={(e) => {
                      let val = e.target.value
                      handleChange('e_butce', val)
                    }}
                    placeholder="Birim Kodu (Örn: 03)"
                    className={`flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 ${settings?.eButceKodu ? 'rounded-r-xl' : 'rounded-xl'}`}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  Say2000i Kodu
                  <span title="Maliye Bakanlığı Say2000i sistemindeki ödeme kurumu kodunuz">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-500 cursor-help" />
                  </span>
                </label>
                <div className="flex">
                  {settings?.say2000iKodu && (
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs font-mono">
                      {settings.say2000iKodu}
                    </span>
                  )}
                  <input
                    type="text"
                    value={(form.say2000i as string) || ''}
                    onChange={(e) => handleChange('say2000i', e.target.value)}
                    placeholder="Birim Kodu (Örn: 01)"
                    className={`flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 ${settings?.say2000iKodu ? 'rounded-r-xl' : 'rounded-xl'}`}
                  />
                </div>
              </div>
            </div>
          )}

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
            {showExtraFields ? 'Ek Bilgileri Gizle' : 'Antet, Kod & Sunum Bilgileri Göster'}
          </button>

          {showExtraFields && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Muhasebe Birimi Bilgileri */}
              <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Muhasebe Birimi Bilgileri{' '}
                  <span className="text-[10px] font-normal text-slate-400">
                    (EKAP veri aktarımında bu bilgiler eşleştirilir)
                  </span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Muhasebe Birim Kodu
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={form.muhasebe_kodu || ''}
                        onChange={(e) => handleChange('muhasebe_kodu', e.target.value)}
                        placeholder="Örn: 38220"
                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Muhasebe Birim Adı
                    </label>
                    <Input
                      value={form.muhasebe_adi || ''}
                      onChange={(e) => handleChange('muhasebe_adi', e.target.value)}
                      placeholder="Muhasebe Birimi Adı"
                      className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Harcama Birimi Bilgileri */}
              <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Harcama Birimi Bilgileri{' '}
                  <span className="text-[10px] font-normal text-slate-400">
                    (EKAP veri aktarımında bu bilgiler eşleştirilir)
                  </span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Harcama Birim Kodu
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={form.harcama_kodu || ''}
                        onChange={(e) => handleChange('harcama_kodu', e.target.value)}
                        placeholder="Örn: 38.22.00.01"
                        className="bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Harcama Birim Adı
                    </label>
                    <Input
                      value={form.harcama_adi || ''}
                      onChange={(e) => handleChange('harcama_adi', e.target.value)}
                      placeholder="Harcama Birimi Adı"
                      className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>
              {!isMuhasebe && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      e-Bütçe Kodu
                      <span title="Kurumunuzun e-Bütçe sistemindeki ön ek kodudur (Örn: 38.xx.xx)">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-500 cursor-help" />
                      </span>
                    </label>
                    <div className="flex">
                      {settings?.eButceKodu && (
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs font-mono">
                          {settings.eButceKodu}.
                        </span>
                      )}
                      <input
                        type="text"
                        value={(form.e_butce as string) || ''}
                        onChange={(e) => {
                          let val = e.target.value
                          handleChange('e_butce', val)
                        }}
                        placeholder="Birim Kodu (Örn: 03)"
                        className={`flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 ${settings?.eButceKodu ? 'rounded-r-xl' : 'rounded-xl'}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      Say2000i Kodu
                      <span title="Maliye Bakanlığı Say2000i sistemindeki ödeme kurumu kodunuz">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-500 cursor-help" />
                      </span>
                    </label>
                    <div className="flex">
                      {settings?.say2000iKodu && (
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs font-mono">
                          {settings.say2000iKodu}
                        </span>
                      )}
                      <input
                        type="text"
                        value={(form.say2000i as string) || ''}
                        onChange={(e) => handleChange('say2000i', e.target.value)}
                        placeholder="Birim Kodu (Örn: 01)"
                        className={`flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 ${settings?.say2000iKodu ? 'rounded-r-xl' : 'rounded-xl'}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Field
                label="Antet Ek Satır"
                field="antet_ek_satir"
                form={form}
                handleChange={handleChange}
                placeholder="Antet yazısında ek satır"
              />

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  İhtiyaç Yerleri
                </label>
                {ihtiyacYeriList.map((yer, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={yer}
                      onChange={(e) => {
                        const newList = [...ihtiyacYeriList]
                        newList[index] = e.target.value
                        setIhtiyacYeriList(newList)
                      }}
                      placeholder={`${index + 1}. İhtiyaç Yeri (Örn: Fen İşleri Ambarı)`}
                      className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const newList = ihtiyacYeriList.filter((_, i) => i !== index)
                        if (newList.length === 0) newList.push('')
                        setIhtiyacYeriList(newList)
                      }}
                      className="h-9 w-9 p-0 text-slate-400 hover:text-red-500 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIhtiyacYeriList([...ihtiyacYeriList, ''])}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 p-1 h-auto"
                >
                  <Plus className="w-3 h-3 mr-1" /> Yeni Satır Ekle
                </Button>
              </div>

              <Field
                label="Sunum Makamı"
                field="sunum_makami"
                form={form}
                handleChange={handleChange}
                placeholder="Sunulacak makam"
              />

              <div className="col-span-full">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  DETSİS Kodu{' '}
                  <span className="text-[10px] font-normal text-slate-400">(Eski adıyla DTVT)</span>
                  <a
                    href={
                      form.dtvt_kodu
                        ? `https://www.kaysis.gov.tr/Kutuphane/Kurum/Detay/${form.dtvt_kodu}`
                        : 'https://www.kaysis.gov.tr/'
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 ml-auto"
                    title="Devlet Teşkilatı Merkezi Kayıt Sistemi"
                  >
                    DETSİS Sorgula <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <Input
                  value={form.dtvt_kodu || ''}
                  onChange={(e) => {
                    handleChange('dtvt_kodu', e.target.value)
                    handleChange('detsis_kodu', e.target.value)
                  }}
                  placeholder="Biriminizin DETSİS kodunu girin..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                />
                <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-100 dark:border-amber-900/50 flex flex-col gap-1.5 leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      DTVT sistemi, DETSİS olarak güncellenmiştir. Birim kodunuzu bilmiyorsanız{' '}
                      <a
                        href={
                          form.dtvt_kodu
                            ? `https://detsis.gov.tr/birim/${form.dtvt_kodu}/${form.dtvt_kodu}/${new Date().toISOString().split('T')[0]}`
                            : 'https://detsis.gov.tr/'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold underline hover:text-amber-700 dark:hover:text-amber-400"
                      >
                        DETSİS'te Arama Yapın
                      </a>
                      .
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  İlgili Personel (Ayrıntılı Bilgi)
                </label>
                <select
                  value={form.ilgili_personel_id || ''}
                  onChange={(e) =>
                    handleChange(
                      'ilgili_personel_id',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-sm py-2 h-10 rounded-xl px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  disabled={isLoadingPersonel}
                  title="İlgili Personel"
                >
                  <option value="">-- Personel Seçiniz --</option>
                  {personeller.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.ad_soyad}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <Button type="button" variant="outline" onClick={closeModal}>
              İptal
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-md">
              {editingBirimId ? 'Güncelle' : 'Birimi Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
