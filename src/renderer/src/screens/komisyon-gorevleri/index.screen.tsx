import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClipboardCheck, Search, Plus, Trash2, Edit } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function KomisyonGorevleriScreen(): React.JSX.Element {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ ad: '', aciklama: '' })

  const { data: gorevler = [], isLoading } = useQuery({
    queryKey: ['komisyon_gorevleri'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_KomisyonGorevi WHERE aktif_mi = 1 ORDER BY id ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data
    }
  })

  const filteredGorevler = gorevler.filter(
    (g: any) =>
      g.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.aciklama && g.aciklama.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!formData.ad.trim()) throw new Error('Görev adı boş olamaz.')

      if (editingId) {
        const res = await window.electron.ipcRenderer.invoke('db:transaction', [
          {
            sql: 'UPDATE TANIM_KomisyonGorevi SET ad = ?, aciklama = ? WHERE id = ?',
            params: [formData.ad, formData.aciklama, editingId]
          }
        ])
        if (!res.success) throw new Error(res.error)
      } else {
        const res = await window.electron.ipcRenderer.invoke('db:transaction', [
          {
            sql: 'INSERT INTO TANIM_KomisyonGorevi (ad, aciklama) VALUES (?, ?)',
            params: [formData.ad, formData.aciklama]
          }
        ])
        if (!res.success) throw new Error(res.error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['komisyon_gorevleri'] })
      setIsFormOpen(false)
      setEditingId(null)
      setFormData({ ad: '', aciklama: '' })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke('db:transaction', [
        {
          sql: 'DELETE FROM TANIM_KomisyonGorevi WHERE id = ?',
          params: [id]
        }
      ])
      if (!res.success) throw new Error(res.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['komisyon_gorevleri'] })
    }
  })

  const handleEdit = (gorev: any) => {
    setFormData({ ad: gorev.ad, aciklama: gorev.aciklama || '' })
    setEditingId(gorev.id)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setFormData({ ad: '', aciklama: '' })
    setEditingId(null)
    setIsFormOpen(true)
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-indigo-500" />
            Komisyon Görev Tanımları
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Komisyonlarda personellere atanabilecek unvan ve görevleri yönetin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 items-start flex-1 min-h-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm min-h-[450px] flex flex-col overflow-hidden relative">
          <div className="flex flex-col lg:flex-row gap-6 p-6 h-full">
            {/* Sol Taraf: Liste */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Görev adı veya açıklama ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                />
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-1 gap-3">
                  {isLoading ? (
                    <div className="py-12 text-center text-slate-500">Yükleniyor...</div>
                  ) : filteredGorevler.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      Görev bulunamadı.
                    </div>
                  ) : (
                    filteredGorevler.map((gorev: any) => (
                      <div
                        key={gorev.id}
                        className="group p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                              {gorev.ad.charAt(0)}
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                              {gorev.ad}
                            </h3>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(gorev)}
                              title="Görevi Düzenle"
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
                                  deleteMutation.mutate(gorev.id)
                                }
                              }}
                              title="Görevi Sil"
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {gorev.aciklama && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed ml-13">
                            {gorev.aciklama}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sağ Taraf: Form */}
            <div className="w-full lg:w-[400px] shrink-0">
              <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 sticky top-0">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    {editingId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {editingId ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Görev Adı <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Örn: Başkan, Üye, Raportör"
                      value={formData.ad}
                      onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                      className="bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Açıklama
                    </label>
                    <textarea
                      placeholder="Görevin yetki ve sorumlulukları..."
                      value={formData.aciklama}
                      onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                      className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:border-slate-800 dark:bg-slate-900 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  {saveMutation.isError && (
                    <div className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                      {saveMutation.error.message}
                    </div>
                  )}

                  <div className="pt-2 flex flex-col gap-2">
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold shadow-sm shadow-indigo-500/20"
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending || !formData.ad.trim()}
                    >
                      {saveMutation.isPending
                        ? 'Kaydediliyor...'
                        : editingId
                          ? 'Güncelle'
                          : 'Görevi Ekle'}
                    </Button>

                    {editingId && (
                      <Button
                        variant="ghost"
                        className="w-full text-slate-500 hover:text-slate-700"
                        onClick={handleAdd}
                      >
                        İptal ve Yeni Ekle
                      </Button>
                    )}
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
