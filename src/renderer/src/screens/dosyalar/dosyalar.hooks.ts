import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface TeminDosyasi {
  id: number
  temin_no: string
  dosya_acilis_tarihi: string | null
  butce_yili: number | null
  butce_tipi: string | null
  konu: string
  isin_aciklamasi: string | null
  birim_id: number | null
  
  antet_ek_satir: string | null
  sunulacak_makam: string | null
  ihtiyac_yeri: string | null
  
  kurumsal_kod: string | null
  fonksiyonel_kod: string | null
  muhasebe_birimi: string | null
  harcama_birimi: string | null
  finansman_kodu: string | null
  ekonomik_kod: string | null
  
  talep_tarihi: string | null
  talep_sayisi: string | null
  
  ihale_tipi: string | null
  tur: string
  ihale_sekli: string | null
  
  teklif_sozlesme_turu: string | null
  alt_yuklenici_olacak_mi: number
  kismi_teklif_verilecek_mi: number
  fiyat_farki_dayanagi: string | null
  yatirim_proje_no: string | null
  avans_verilecek_mi: number
  
  yaklasik_maliyet_hesaplamasi: string | null
  kdv: string | null
  hesaplama_esasi: string | null
  komisyon_takdiri: string | null
  tibbi_cihaz_alimi_mi: number
  
  irtibat_yetkilisi_id: number | null
  son_teklif_verme_tarihi: string | null
  teslim_tarihi: string | null
  
  yaklasik_maliyet: number
  butce_kodu: string | null
  temin_tarihi: string | null
  firma_id: number | null
  onay_personel_id: number | null
  hazirlayan_personel_id: number | null
  durum_asama_id: number | null
  mevzuat_id: number | null
  notlar: string | null
  created_at: string
}

const fetchDosyalar = async (): Promise<TeminDosyasi[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM DATA_TeminDosyasi ORDER BY created_at DESC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

export function useDosyalarHooks() {
  const queryClient = useQueryClient()

  const { data: dosyalar = [], isLoading: isLoadingDosyalar } = useQuery({
    queryKey: ['temin_dosyalari'],
    queryFn: fetchDosyalar
  })

  const addDosyaMutation = useMutation({
    mutationFn: async (dosya: Partial<TeminDosyasi>) => {
      const columns = Object.keys(dosya).filter(k => k !== 'id' && dosya[k as keyof TeminDosyasi] !== undefined)
      const placeholders = columns.map(() => '?').join(', ')
      const values = columns.map(k => dosya[k as keyof TeminDosyasi])
      
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO DATA_TeminDosyasi (${columns.join(', ')}) VALUES (${placeholders})`,
        values
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['temin_dosyalari'] })
  })

  const updateDosyaMutation = useMutation({
    mutationFn: async (dosya: Partial<TeminDosyasi> & { id: number }) => {
      const columns = Object.keys(dosya).filter(k => k !== 'id' && dosya[k as keyof TeminDosyasi] !== undefined)
      const setClause = columns.map(k => `${k} = ?`).join(', ')
      const values = columns.map(k => dosya[k as keyof TeminDosyasi])
      
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE DATA_TeminDosyasi SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, dosya.id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['temin_dosyalari'] })
  })

  const deleteDosyaMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminDosyasi WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['temin_dosyalari'] })
  })

  return {
    dosyalar,
    isLoadingDosyalar,
    addDosya: addDosyaMutation.mutateAsync,
    updateDosya: updateDosyaMutation.mutateAsync,
    deleteDosya: deleteDosyaMutation.mutateAsync
  }
}
