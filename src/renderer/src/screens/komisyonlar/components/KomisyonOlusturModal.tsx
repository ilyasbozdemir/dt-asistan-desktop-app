import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Trash2, Plus } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'

interface KomisyonOlusturModalProps {
  isOpen: boolean
  onClose: () => void
  komisyonId?: number | null
}

export function KomisyonOlusturModal({
  isOpen,
  onClose,
  komisyonId
}: KomisyonOlusturModalProps): React.JSX.Element | null {
  const queryClient = useQueryClient()
  const [ad, setAd] = useState('')

  // Üyeler state: { personelId: number, gorevId: number, asilMi: boolean }
  const [uyeler, setUyeler] = useState<any[]>([])

  // Şablonlar state
  const [seciliSablonlar, setSeciliSablonlar] = useState<number[]>([])

  const { data: gorevler = [] } = useQuery({
    queryKey: ['komisyon_gorevleri'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_KomisyonGorevi WHERE aktif_mi = 1 ORDER BY id ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    enabled: isOpen
  })

  // Şablon seçenekleri
  const { data: tumSablonlar = [] } = useQuery({
    queryKey: ['komisyon_sablon_secenekleri'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Sablon WHERE aktif_mi = 1 ORDER BY ad ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    enabled: isOpen
  })

  // Fetch for edit
  useQuery({
    queryKey: ['komisyon_detay', komisyonId],
    queryFn: async () => {
      if (!komisyonId) return null

      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Komisyon WHERE id = ?',
        [komisyonId]
      )
      if (!res.success || !res.data[0]) throw new Error(res.error || 'Komisyon bulunamadı')
      setAd(res.data[0].ad)

      const membersRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_KomisyonUye WHERE komisyon_id = ?',
        [komisyonId]
      )
      if (membersRes.success && membersRes.data) {
        setUyeler(
          membersRes.data.map((m: any) => ({
            id: Date.now() + Math.random(),
            personelId: m.personel_id,
            gorevId: m.gorev_id,
            asilMi: m.asil_mi
          }))
        )
      }

      // Mevcut şablonları çek
      const sablonRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?',
        [komisyonId]
      )
      if (sablonRes.success && sablonRes.data) {
        setSeciliSablonlar(sablonRes.data.map((s: any) => s.sablon_id))
      }

      return res.data[0]
    },
    enabled: !!komisyonId && isOpen
  })

  const handleAddUye = () => {
    setUyeler([...uyeler, { id: Date.now(), personelId: null, gorevId: '', asilMi: 1 }])
  }

  const handleRemoveUye = (id: number) => {
    setUyeler(uyeler.filter((u) => u.id !== id))
  }

  const handleUyeChange = (id: number, field: string, value: any) => {
    setUyeler(uyeler.map((u) => (u.id === id ? { ...u, [field]: value } : u)))
  }

  const handleSablonToggle = (sablonId: number) => {
    setSeciliSablonlar((prev) =>
      prev.includes(sablonId) ? prev.filter((id) => id !== sablonId) : [...prev, sablonId]
    )
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!ad) throw new Error('Lütfen komisyon adı giriniz.')
      if (uyeler.some((u) => !u.gorevId)) {
        throw new Error('Lütfen tüm üyelerin görev (rol) seçimlerini yapınız.')
      }

      if (komisyonId) {
        const updateRes = await window.electron.ipcRenderer.invoke('db:transaction', [
          {
            sql: 'UPDATE TANIM_Komisyon SET ad = ? WHERE id = ?',
            params: [ad, komisyonId]
          },
          {
            sql: 'DELETE FROM TANIM_KomisyonUye WHERE komisyon_id = ?',
            params: [komisyonId]
          },
          {
            sql: 'DELETE FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?',
            params: [komisyonId]
          }
        ])
        if (!updateRes.success) throw new Error(updateRes.error)

        const uyeQueries = uyeler.map((u) => ({
          sql: 'INSERT INTO TANIM_KomisyonUye (komisyon_id, gorev_id, asil_mi) VALUES (?, ?, ?)',
          params: [komisyonId, u.gorevId, u.asilMi]
        }))

        if (uyeQueries.length > 0) {
          const uyeRes = await window.electron.ipcRenderer.invoke('db:transaction', uyeQueries)
          if (!uyeRes.success) throw new Error(uyeRes.error)
        }

        const sablonQueries = seciliSablonlar.map((sId) => ({
          sql: 'INSERT INTO TANIM_Komisyon_Sablon (komisyon_id, sablon_id) VALUES (?, ?)',
          params: [komisyonId, sId]
        }))

        if (sablonQueries.length > 0) {
          const sablonRes = await window.electron.ipcRenderer.invoke(
            'db:transaction',
            sablonQueries
          )
          if (!sablonRes.success) throw new Error(sablonRes.error)
        }

        return komisyonId
      } else {
        const res = await window.electron.ipcRenderer.invoke('db:transaction', [
          {
            sql: 'INSERT INTO TANIM_Komisyon (ad) VALUES (?)',
            params: [ad]
          }
        ])

        if (!res.success) throw new Error(res.error)
        const newKomisyonId = res.lastInsertRowid

        const uyeQueries = uyeler.map((u) => ({
          sql: 'INSERT INTO TANIM_KomisyonUye (komisyon_id, gorev_id, asil_mi) VALUES (?, ?, ?)',
          params: [newKomisyonId, u.gorevId, u.asilMi]
        }))

        if (uyeQueries.length > 0) {
          const uyeRes = await window.electron.ipcRenderer.invoke('db:transaction', uyeQueries)
          if (!uyeRes.success) throw new Error(uyeRes.error)
        }

        const sablonQueries = seciliSablonlar.map((sId) => ({
          sql: 'INSERT INTO TANIM_Komisyon_Sablon (komisyon_id, sablon_id) VALUES (?, ?)',
          params: [newKomisyonId, sId]
        }))

        if (sablonQueries.length > 0) {
          const sablonRes = await window.electron.ipcRenderer.invoke(
            'db:transaction',
            sablonQueries
          )
          if (!sablonRes.success) throw new Error(sablonRes.error)
        }

        return newKomisyonId
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['komisyonlar'] })
      onClose()
      setAd('')
      setUyeler([])
      setSeciliSablonlar([])
    }
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={komisyonId ? 'Komisyonu Düzenle' : 'Yeni Komisyon Oluştur'}
      description="Komisyonun kadro ve kontenjanlarını belirleyin."
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {saveMutation.isError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {saveMutation.error?.message}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Komisyon Adı
          </label>
          <Input
            type="text"
            placeholder="Örn: Bilişim Sistemleri Fiyat Araştırma Komisyonu"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Komisyon Rolleri / Kadroları
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bu komisyonda bulunması gereken görev/rolleri belirleyin. Personel atamaları daha
                sonra yapılacaktır.
              </p>
            </div>
            <Button
              onClick={handleAddUye}
              variant="outline"
              className="gap-2 text-sm border-dashed"
            >
              <Plus className="w-4 h-4" /> Rol Ekle
            </Button>
          </div>

          <div className="space-y-3">
            {uyeler.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 border-dashed">
                <p className="text-sm text-slate-500">
                  Henüz rol/kadro eklenmedi. "Rol Ekle" butonunu kullanarak komisyon yapısını
                  oluşturabilirsiniz.
                </p>
              </div>
            ) : (
              uyeler.map((uye, index) => (
                <div
                  key={uye.id}
                  className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-bold shrink-0">
                    {index + 1}
                  </div>

                  <select
                    title="Görev Seç"
                    value={uye.gorevId}
                    onChange={(e) =>
                      handleUyeChange(
                        uye.id,
                        'gorevId',
                        e.target.value ? Number(e.target.value) : ''
                      )
                    }
                    className="flex-1 min-w-[150px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white"
                  >
                    <option value="">-- Görev Seç --</option>
                    {gorevler.map((g: any) => (
                      <option key={g.id} value={g.id}>
                        {g.ad}
                      </option>
                    ))}
                  </select>

                  <select
                    title="Durum"
                    value={uye.asilMi}
                    onChange={(e) => handleUyeChange(uye.id, 'asilMi', Number(e.target.value))}
                    className="w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white"
                  >
                    <option value={1}>Asil Üye</option>
                    <option value={0}>Yedek Üye</option>
                  </select>

                  <button
                    onClick={() => handleRemoveUye(uye.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Şablonlar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Belge ve Şablonlar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bu komisyonun üretebileceği belgeleri (ör: Onay/Olur, Karar Tutanağı) seçin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {tumSablonlar.map((sablon: any) => (
              <label
                key={sablon.id}
                className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                  seciliSablonlar.includes(sablon.id)
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-500/50'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    checked={seciliSablonlar.includes(sablon.id)}
                    onChange={() => handleSablonToggle(sablon.id)}
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {sablon.ad}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1">
                    {sablon.aciklama || 'Şablon'}
                  </div>
                </div>
              </label>
            ))}
            {tumSablonlar.length === 0 && (
              <div className="col-span-full text-sm text-slate-500 text-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                Sistemde tanımlı şablon bulunamadı.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saveMutation.isPending}>
            İptal
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Kaydediliyor...' : komisyonId ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
