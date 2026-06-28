import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface OlcuBirimi {
  id: number
  ad: string
  aktif_mi: number
  created_at: string
}

export function useOlcuBirimleri() {
  return useQuery({
    queryKey: ['olcu-birimleri'],
    queryFn: async (): Promise<OlcuBirimi[]> => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_OlcuBirimi ORDER BY ad ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data
    }
  })
}

export function useSaveOlcuBirimi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (birim: Partial<OlcuBirimi>) => {
      let res
      if (birim.id) {
        // Update
        res = await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE TANIM_OlcuBirimi SET ad = ?, aktif_mi = ? WHERE id = ?',
          [birim.ad, birim.aktif_mi ?? 1, birim.id]
        )
      } else {
        // Insert
        res = await window.electron.ipcRenderer.invoke(
          'db:run',
          'INSERT INTO TANIM_OlcuBirimi (ad, aktif_mi) VALUES (?, ?)',
          [birim.ad, birim.aktif_mi ?? 1]
        )
      }
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['olcu-birimleri'] })
    }
  })
}

export function useDeleteOlcuBirimi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      // First get the name of the unit
      const birimRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT ad FROM TANIM_OlcuBirimi WHERE id = ?',
        [id]
      )

      if (birimRes.success && birimRes.data && birimRes.data.length > 0) {
        const ad = birimRes.data[0].ad
        // Check if used in TANIM_Kalem
        const checkRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT COUNT(*) as count FROM TANIM_Kalem WHERE birim = ?',
          [ad]
        )
        if (checkRes.success && checkRes.data && checkRes.data[0].count > 0) {
          throw new Error(
            'Bu ölçü birimi ' +
              checkRes.data[0].count +
              ' adet malzemede kullanıldığı için silinemez! Bunun yerine "Pasif" duruma getirebilirsiniz.'
          )
        }
      }

      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_OlcuBirimi WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['olcu-birimleri'] })
    }
  })
}
