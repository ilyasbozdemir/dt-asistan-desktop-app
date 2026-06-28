import React, { useState } from 'react'
import { usePersonelHooks, Personel, PersonelWithRoles, Rol } from './personel.hooks'
import { useBirimlerHooks } from '../birimler/birimler.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  ArrowLeft,
  HelpCircle,
  UserCheck,
  Save,
  X
} from 'lucide-react'

type ViewMode = 'list' | 'view' | 'form'

export default function PersonelScreen(): React.ReactNode {
  const {
    personelList,
    rollerList,
    isLoading: isPersonelLoading,
    addPersonel,
    updatePersonel,
    deletePersonel
  } = usePersonelHooks()
  const { birimler } = useBirimlerHooks()

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingPersonel, setEditingPersonel] = useState<Personel | null>(null)
  const [viewingPersonel, setViewingPersonel] = useState<Personel | null>(null)

  const [formData, setFormData] = useState<PersonelWithRoles>({
    ad_soyad: '',
    unvan: '',
    sicil_no: '',
    birim: '',
    telefon: '',
    eposta: '',
    aktif_mi: 1,
    assignedRoles: []
  })

  const openForm = (e?: React.MouseEvent, personel?: Personel): void => {
    if (e) e.stopPropagation()
    if (personel) {
      setEditingPersonel(personel)
      const rolesForPersonel = rollerList
        .filter((r) => r.varsayilan_personel_id === personel.id)
        .map((r) => r.rol_kodu)
      setFormData({ ...personel, assignedRoles: rolesForPersonel })
    } else {
      setEditingPersonel(null)
      setFormData({
        ad_soyad: '',
        unvan: '',
        sicil_no: '',
        birim: '',
        telefon: '',
        eposta: '',
        aktif_mi: 1,
        assignedRoles: []
      })
    }
    setViewMode('form')
  }

  const closeForm = (): void => {
    setViewMode('list')
    setEditingPersonel(null)
  }

  const handleViewClick = (personel: Personel) => {
    setViewingPersonel(personel)
    setViewMode('view')
  }

  const closeView = () => {
    setViewingPersonel(null)
    setViewMode('list')
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      if (editingPersonel) {
        await updatePersonel({ ...formData, id: editingPersonel.id })
      } else {
        await addPersonel(formData)
      }
      closeForm()
    } catch (err) {
      console.error(err)
      alert('Kayıt sırasında bir hata oluştu!')
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: number): Promise<void> => {
    e.stopPropagation()
    if (confirm('Bu personeli silmek istediğinize emin misiniz?')) {
      try {
        await deletePersonel(id)
      } catch (err) {
        console.error(err)
        alert('Silme sırasında bir hata oluştu!')
      }
    }
  }

  const toggleRole = (rol_kodu: string, isChecked: boolean) => {
    setFormData((prev) => {
      const roles = prev.assignedRoles || []
      if (isChecked) {
        return { ...prev, assignedRoles: [...roles, rol_kodu] }
      } else {
        return { ...prev, assignedRoles: roles.filter((r) => r !== rol_kodu) }
      }
    })
  }

  if (viewMode === 'view' && viewingPersonel) {
    const rolesOfViewingPerson = rollerList.filter(
      (r) => r.varsayilan_personel_id === viewingPersonel.id
    )

    return (
      <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
        <Button
          variant="ghost"
          onClick={closeView}
          className="w-fit mb-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Listeye Geri Dön
        </Button>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-5 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-3xl uppercase shadow-sm shrink-0 border border-blue-200 dark:border-blue-800">
              {viewingPersonel.ad_soyad.slice(0, 2)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                {viewingPersonel.ad_soyad}
              </h2>
              <div className="text-base font-medium text-slate-500 dark:text-slate-400">
                {viewingPersonel.unvan || 'Unvan Belirtilmedi'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Birim / Müdürlük
              </span>
              <span className="text-base text-slate-700 dark:text-slate-300 font-semibold">
                {viewingPersonel.birim || '-'}
              </span>
            </div>
            <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Kurum Sicil No
              </span>
              <span className="font-mono text-base text-slate-700 dark:text-slate-300 font-semibold">
                {viewingPersonel.sicil_no || '-'}
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-500">Telefon</span>
              <span className="text-base text-slate-800 dark:text-slate-200 font-medium">
                {viewingPersonel.telefon || '-'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-500">E-Posta</span>
              <span className="text-base text-slate-800 dark:text-slate-200 font-medium">
                {viewingPersonel.eposta || '-'}
              </span>
            </div>
          </div>

          <div className="pt-8 mt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" /> Atanmış Varsayılan Roller
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rolesOfViewingPerson.length > 0 ? (
                rolesOfViewingPerson.map((role) => (
                  <div
                    key={role.rol_kodu}
                    className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl"
                  >
                    <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">
                        {role.rol_adi}
                      </span>
                      <span className="block text-xs text-blue-600/70 dark:text-blue-400/70 leading-relaxed">
                        {role.aciklama}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-4 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-2xl italic border border-slate-100 dark:border-slate-800">
                  Bu personelin varsayılan olarak atandığı bir rol bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'form') {
    return (
      <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={closeForm}
            className="w-fit text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Listeye Geri Dön
          </Button>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {editingPersonel ? (
              <Edit className="w-6 h-6 text-blue-500" />
            ) : (
              <Plus className="w-6 h-6 text-blue-500" />
            )}
            {editingPersonel ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Ad Soyad *
              </label>
              <Input
                required
                autoFocus
                placeholder="Örn: Ahmet Yılmaz"
                value={formData.ad_soyad}
                onChange={(e) => setFormData({ ...formData, ad_soyad: e.target.value })}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm py-2 h-11"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Unvan / Görevi
                </label>
                <Input
                  placeholder="Örn: İnşaat Mühendisi"
                  value={formData.unvan || ''}
                  onChange={(e) => setFormData({ ...formData, unvan: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm py-2 h-11"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  Kurum Sicil No
                  <span className="text-[11px] text-slate-400 font-normal">(İsteğe Bağlı)</span>
                  <span title="Personelin kurum içi sicil numarası">
                    <HelpCircle className="w-4 h-4 text-blue-500 cursor-help ml-auto" />
                  </span>
                </label>
                <Input
                  placeholder="Örn: 12345"
                  value={formData.sicil_no || ''}
                  onChange={(e) => setFormData({ ...formData, sicil_no: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm py-2 h-11"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Birim / Müdürlük
              </label>
              <Input
                list="birimler-list"
                placeholder="-- Birim Seçin veya Arayın --"
                value={formData.birim || ''}
                onChange={(e) => setFormData({ ...formData, birim: e.target.value })}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm py-2 h-11"
              />
              <datalist id="birimler-list">
                {birimler.map((b) => (
                  <option key={b.id} value={b.birim_adi} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Telefon
                </label>
                <Input
                  placeholder="Örn: 0555..."
                  value={formData.telefon || ''}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm py-2 h-11"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  E-Posta
                </label>
                <Input
                  type="email"
                  placeholder="Örn: ornek@kurum.gov.tr"
                  value={formData.eposta || ''}
                  onChange={(e) => setFormData({ ...formData, eposta: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm py-2 h-11"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 mt-8">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" /> Şablonlarda Varsayılan Görev
                (Yetkilendirme)
              </h4>
              <p className="text-xs text-slate-500">
                Seçtiğiniz roller, yeni oluşturulan belgelerde bu personel adıyla otomatik
                doldurulacaktır.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {rollerList.map((rol) => (
                  <label
                    key={rol.rol_kodu}
                    className="flex items-start gap-3 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-800 transition-colors group"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 mt-0.5 text-blue-600 rounded border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer"
                      checked={formData.assignedRoles?.includes(rol.rol_kodu)}
                      onChange={(e) => toggleRole(rol.rol_kodu, e.target.checked)}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {rol.rol_adi}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        {rol.aciklama}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 mt-8">
            <Button
              type="button"
              variant="outline"
              className="px-6 py-2.5 h-11"
              onClick={closeForm}
            >
              <X className="w-4 h-4 mr-2" /> İptal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 shadow-md px-8 py-2.5 h-11 text-sm"
            >
              <Save className="w-4 h-4 mr-2" />{' '}
              {editingPersonel ? 'Değişiklikleri Kaydet' : 'Personeli Ekle'}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-855 dark:text-slate-100">
            <Users className="w-8 h-8 text-blue-600" />
            Personel Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Kurum personelini buradan ekleyebilir ve yetkilerini belirleyebilirsiniz.
          </p>
        </div>
        <Button
          onClick={(e) => openForm(e)}
          className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md flex items-center px-4 py-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Yeni Personel Ekle
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isPersonelLoading ? (
            <div className="col-span-full p-8 text-center text-slate-450 dark:text-slate-500 animate-pulse italic">
              Yükleniyor...
            </div>
          ) : personelList.length === 0 ? (
            <div className="col-span-full p-16 flex flex-col items-center justify-center text-slate-450 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <Users className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Henüz Personel Eklenmemiş
              </h3>
              <p className="text-xs mt-1 text-slate-500">
                Süreçlerde görev alacak personeli hemen eklemeye başlayın.
              </p>
            </div>
          ) : (
            personelList.map((p) => {
              const assignedRoles = rollerList.filter((r) => r.varsayilan_personel_id === p.id)

              return (
                <div
                  key={p.id}
                  onClick={() => handleViewClick(p)}
                  className="flex flex-col p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors group relative cursor-pointer"
                >
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      title="Düzenle"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => openForm(e, p)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      title="Sil"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, p.id)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 mb-3 pr-12">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                      {p.ad_soyad.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                        {p.ad_soyad}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {p.unvan || 'Unvan Belirtilmedi'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-4 flex-1">
                    {p.birim && <div className="truncate">🏢 {p.birim}</div>}
                    {p.sicil_no && <div className="truncate">📋 Sicil No: {p.sicil_no}</div>}
                    {p.telefon && <div>📞 {p.telefon}</div>}
                    {p.eposta && <div className="truncate">✉️ {p.eposta}</div>}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-auto border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
                    {assignedRoles.length > 0 ? (
                      assignedRoles.map((role) => (
                        <span
                          key={role.rol_kodu}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50"
                        >
                          <Shield className="w-3 h-3" /> {role.rol_adi}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Özel yetki yok</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
