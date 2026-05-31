import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Kalem {
  id: number
  barkod_id: string
  tasinir_kodu: string | null
  kalem_adi: string
  tipi: string
  birim: string
  kategori: string | null
  aktif_mi: number
  notlar: string | null
}

const fetchKalemler = async (): Promise<Kalem[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_Kalem ORDER BY id DESC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

export function useMalzemelerHooks() {
  const queryClient = useQueryClient()

  const { data: kalemList = [], isLoading } = useQuery({
    queryKey: ['kalemler'],
    queryFn: fetchKalemler
  })

  const addKalemMutation = useMutation({
    mutationFn: async (kalem: Partial<Kalem>) => {
      const sql = `INSERT INTO TANIM_Kalem (barkod_id, tasinir_kodu, kalem_adi, tipi, birim, kategori, aktif_mi, notlar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      const params = [
        kalem.barkod_id,
        kalem.tasinir_kodu || null,
        kalem.kalem_adi,
        kalem.tipi || 'Mal Alımı',
        kalem.birim || 'Adet',
        kalem.kategori || null,
        kalem.aktif_mi !== undefined ? kalem.aktif_mi : 1,
        kalem.notlar || null
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kalemler'] })
    }
  })

  const updateKalemMutation = useMutation({
    mutationFn: async (kalem: Partial<Kalem> & { id: number }) => {
      const sql = `UPDATE TANIM_Kalem SET barkod_id = ?, tasinir_kodu = ?, kalem_adi = ?, tipi = ?, birim = ?, kategori = ?, aktif_mi = ?, notlar = ? WHERE id = ?`
      const params = [
        kalem.barkod_id,
        kalem.tasinir_kodu || null,
        kalem.kalem_adi,
        kalem.tipi || 'Mal Alımı',
        kalem.birim || 'Adet',
        kalem.kategori || null,
        kalem.aktif_mi !== undefined ? kalem.aktif_mi : 1,
        kalem.notlar || null,
        kalem.id
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kalemler'] })
    }
  })

  const deleteKalemMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_Kalem WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kalemler'] })
    }
  })

  return {
    kalemList,
    isLoading,
    addKalem: addKalemMutation.mutateAsync,
    updateKalem: updateKalemMutation.mutateAsync,
    deleteKalem: deleteKalemMutation.mutateAsync
  }
}
