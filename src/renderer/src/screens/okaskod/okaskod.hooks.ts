import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface OkasKod {
  id: number
  kod: string // 8 haneli OKAS kodu: örn. 30192700
  bolum: string | null // İlk 2 hane
  grup: string | null // İlk 3 hane
  sinif: string | null // İlk 4 hane
  aciklama: string
}

const fetchOkasKodlar = async (): Promise<OkasKod[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_OkasKod ORDER BY kod ASC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

export function useOkasKodHooks() {
  const queryClient = useQueryClient()

  const { data: okasKodList = [], isLoading } = useQuery({
    queryKey: ['okas_kodlar'],
    queryFn: fetchOkasKodlar
  })

  const addOkasKodMutation = useMutation({
    mutationFn: async (kayit: Omit<OkasKod, 'id'>) => {
      const sql = `INSERT INTO TANIM_OkasKod (kod, bolum, grup, sinif, aciklama) VALUES (?, ?, ?, ?, ?)`
      const params = [kayit.kod, kayit.bolum, kayit.grup, kayit.sinif, kayit.aciklama]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okas_kodlar'] })
    }
  })

  const deleteOkasKodMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_OkasKod WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okas_kodlar'] })
    }
  })

  return {
    okasKodList,
    isLoading,
    addOkasKod: addOkasKodMutation.mutateAsync,
    deleteOkasKod: deleteOkasKodMutation.mutateAsync
  }
}
