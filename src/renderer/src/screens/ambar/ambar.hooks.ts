import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Ambar {
  id: number
  ambar_adi: string
  aciklama: string
  adres: string
  semt: string
  posta_kodu: string
  sehir: string
  telefon: string
  faks: string
  web_adresi: string
  email: string
  tasinir_kodu: string
  tasinir_adi: string
  aktif_mi: number
  created_at: string
}

export type AmbarInput = Omit<Ambar, 'id' | 'aktif_mi' | 'created_at'>

const fetchAmbarlar = async (): Promise<Ambar[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_Ambar ORDER BY ambar_adi ASC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

export function useAmbarHooks() {
  const queryClient = useQueryClient()

  const { data: ambarlar = [], isLoading: isLoadingAmbarlar } = useQuery({
    queryKey: ['ambarlar'],
    queryFn: fetchAmbarlar
  })

  const addAmbarMutation = useMutation({
    mutationFn: async (ambar: AmbarInput) => {
      const cols = [
        'ambar_adi',
        'aciklama',
        'adres',
        'semt',
        'posta_kodu',
        'sehir',
        'telefon',
        'faks',
        'web_adresi',
        'email',
        'tasinir_kodu',
        'tasinir_adi'
      ]
      const placeholders = cols.map(() => '?').join(', ')
      const values = cols.map((col) => (ambar as any)[col] || '')
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO TANIM_Ambar (${cols.join(', ')}) VALUES (${placeholders})`,
        values
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ambarlar'] })
  })

  const deleteAmbarMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_Ambar WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ambarlar'] })
  })

  return {
    ambarlar,
    isLoadingAmbarlar,
    addAmbar: addAmbarMutation.mutateAsync,
    deleteAmbar: deleteAmbarMutation.mutateAsync
  }
}
