import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Personel {
  id: number
  ad_soyad: string
  unvan: string | null
  birim: string | null
  sicil_no: string | null
  telefon: string | null
  eposta: string | null
  aktif_mi: number
  notlar: string | null
}

export interface Rol {
  id: number
  rol_adi: string
  rol_kodu: string
  varsayilan_personel_id: number | null
  aciklama: string | null
}

export interface PersonelWithRoles extends Partial<Personel> {
  assignedRoles?: string[] // rol_kodu listesi
}

const fetchPersonel = async (): Promise<Personel[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_Personel ORDER BY id DESC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

const fetchRoller = async (): Promise<Rol[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_Roller ORDER BY id ASC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

export function usePersonelHooks() {
  const queryClient = useQueryClient()

  const { data: personelList = [], isLoading: isPersonelLoading } = useQuery({
    queryKey: ['personel'],
    queryFn: fetchPersonel
  })

  const { data: rollerList = [], isLoading: isRollerLoading } = useQuery({
    queryKey: ['roller'],
    queryFn: fetchRoller
  })

  const addPersonelMutation = useMutation({
    mutationFn: async (personel: PersonelWithRoles) => {
      const sql = `INSERT INTO TANIM_Personel (ad_soyad, unvan, birim, sicil_no, telefon, eposta, aktif_mi) VALUES (?, ?, ?, ?, ?, ?, ?)`
      const params = [
        personel.ad_soyad,
        personel.unvan || null,
        personel.birim || null,
        personel.sicil_no || null,
        personel.telefon || null,
        personel.eposta || null,
        personel.aktif_mi !== undefined ? personel.aktif_mi : 1
      ]

      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)

      const newPersonelId = res.lastInsertRowid

      // Rol atamaları
      if (personel.assignedRoles && personel.assignedRoles.length > 0) {
        const transactions: any[] = []
        // Yeni seçilen rolleri bu personele ata
        for (const r of personel.assignedRoles) {
          transactions.push({
            sql: 'UPDATE TANIM_Roller SET varsayilan_personel_id = ? WHERE rol_kodu = ?',
            params: [newPersonelId, r]
          })
        }
        if (transactions.length > 0) {
          await window.electron.ipcRenderer.invoke('db:transaction', transactions)
        }
      }

      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] })
      queryClient.invalidateQueries({ queryKey: ['roller'] })
    }
  })

  const updatePersonelMutation = useMutation({
    mutationFn: async (personel: PersonelWithRoles & { id: number }) => {
      const sql = `UPDATE TANIM_Personel SET ad_soyad = ?, unvan = ?, birim = ?, sicil_no = ?, telefon = ?, eposta = ?, aktif_mi = ? WHERE id = ?`
      const params = [
        personel.ad_soyad,
        personel.unvan || null,
        personel.birim || null,
        personel.sicil_no || null,
        personel.telefon || null,
        personel.eposta || null,
        personel.aktif_mi !== undefined ? personel.aktif_mi : 1,
        personel.id
      ]

      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)

      // Rol atamalarını güncelle
      if (personel.assignedRoles) {
        const transactions: any[] = []
        // Önce bu personelin tüm rollerden çıkarılması
        transactions.push({
          sql: 'UPDATE TANIM_Roller SET varsayilan_personel_id = NULL WHERE varsayilan_personel_id = ?',
          params: [personel.id]
        })

        // Sonra seçilen rollere atanması
        for (const r of personel.assignedRoles) {
          transactions.push({
            sql: 'UPDATE TANIM_Roller SET varsayilan_personel_id = ? WHERE rol_kodu = ?',
            params: [personel.id, r]
          })
        }

        await window.electron.ipcRenderer.invoke('db:transaction', transactions)
      }

      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] })
      queryClient.invalidateQueries({ queryKey: ['roller'] })
    }
  })

  const deletePersonelMutation = useMutation({
    mutationFn: async (id: number) => {
      const transactions = [
        {
          sql: 'UPDATE TANIM_Roller SET varsayilan_personel_id = NULL WHERE varsayilan_personel_id = ?',
          params: [id]
        },
        {
          sql: 'DELETE FROM TANIM_Personel WHERE id = ?',
          params: [id]
        }
      ]
      const res = await window.electron.ipcRenderer.invoke('db:transaction', transactions)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] })
      queryClient.invalidateQueries({ queryKey: ['roller'] })
    }
  })

  return {
    personelList,
    rollerList,
    isLoading: isPersonelLoading || isRollerLoading,
    addPersonel: addPersonelMutation.mutateAsync,
    updatePersonel: updatePersonelMutation.mutateAsync,
    deletePersonel: deletePersonelMutation.mutateAsync
  }
}
