import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ClipboardCheck, Search, Plus, Trash2, Edit, X } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface GorevTanimlariModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GorevTanimlariModal({
  isOpen,
  onClose
}: GorevTanimlariModalProps): React.JSX.Element | null {
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
    },
    enabled: isOpen // Only fetch when modal is open
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

  if (!isOpen) return null

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-indigo-500" />
            Komisyon Görev Tanımları
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Komisyonlarda personellere atanabilecek unvan ve görevleri yönetin.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-6 pb-0 shrink-0 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Görev adı veya açıklama ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
          />
        </div>
        {!isFormOpen && (
          <Button
            onClick={handleAdd}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Yeni Görev Ekle
          </Button>
        )}
      </div>

      {/* Form (If Open) */}
      {isFormOpen && (
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
            {editingId ? 'Görevi Düzenle' : 'Yeni Komisyon Görevi'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Görev Adı <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Örn: Başkan, Üye, Raportör"
                value={formData.ad}
                onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Açıklama
              </label>
              <Input
                type="text"
                placeholder="İsteğe bağlı açıklama..."
                value={formData.aciklama}
                onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
              />
            </div>
          </div>
          {saveMutation.isError && (
            <div className="mb-4 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 p-2.5 rounded-lg border border-red-100 dark:border-red-900/30">
              {saveMutation.error.message}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="text-sm" onClick={() => setIsFormOpen(false)}>
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-slate-500">Yükleniyor...</div>
          ) : filteredGorevler.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">Görev bulunamadı.</div>
          ) : (
            filteredGorevler.map((gorev: any) => (
              <div
                key={gorev.id}
                className="group p-4 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950/50 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      {gorev.ad.charAt(0)}
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{gorev.ad}</h3>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <button
                      onClick={() => handleEdit(gorev)}
                      title="Görevi Düzenle"
                      className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
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
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed ml-10">
                  {gorev.aciklama}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
