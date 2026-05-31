import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface TasinirKod {
  id: number
  hesap_kodu: string
  duzey_1: string | null
  duzey_2: string | null
  duzey_3: string | null
  duzey_4: string | null
  duzey_5: string | null
  tam_kod: string
  aciklama: string
}

const fetchTasinirKodlar = async (): Promise<TasinirKod[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_TasinirKod ORDER BY tam_kod ASC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

export function useTasinirKodHooks() {
  const queryClient = useQueryClient()

  const { data: tasinirKodList = [], isLoading } = useQuery({
    queryKey: ['tasinir_kodlar'],
    queryFn: fetchTasinirKodlar
  })

  const addTasinirKodMutation = useMutation({
    mutationFn: async (kod: Partial<TasinirKod>) => {
      const sql = `INSERT INTO TANIM_TasinirKod (hesap_kodu, duzey_1, duzey_2, duzey_3, duzey_4, duzey_5, tam_kod, aciklama) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      const params = [
        kod.hesap_kodu,
        kod.duzey_1 || null,
        kod.duzey_2 || null,
        kod.duzey_3 || null,
        kod.duzey_4 || null,
        kod.duzey_5 || null,
        kod.tam_kod,
        kod.aciklama
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasinir_kodlar'] })
    }
  })

  const deleteTasinirKodMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_TasinirKod WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasinir_kodlar'] })
    }
  })

  return {
    tasinirKodList,
    isLoading,
    addTasinirKod: addTasinirKodMutation.mutateAsync,
    deleteTasinirKod: deleteTasinirKodMutation.mutateAsync
  }
}
