import { useState, useCallback } from 'react'

export interface KurumVerisi {
  id?: number
  kurum_adi?: string
  kurum_anteti?: string
  makam_adi?: string
  ust_kurum_adi?: string
  logo_sol?: string
  logo_sag?: string
  logo_kurum?: string
  limit_tipi?: string
  finansman_kodu?: string
  kurum_tipi?: string
  alt_kurum_tipi?: string
  alt_kurum_ozel_tanim?: string
  alt_kurum_bizim?: string
  alt_kurum_sizin?: string
  alt_kurum_onun?: string
  alt_kurum_onlarin?: string
  ebutce_kodu?: string
  say2000i_kodu?: string
  fonksiyonel_kod?: string
  muhasebe_birim_kodu?: string
  muhasebe_birim_adi?: string
  harcama_birim_kodu?: string
  harcama_birim_adi?: string
  dtvt_kodu?: string
  detsis_kodu?: string
  konu_ortalama_siniri?: string
  adres?: string
  ilce?: string
  posta_kodu?: string
  il?: string
  telefon?: string
  faks?: string
  eposta?: string
  kep_adresi?: string
  web_sitesi?: string
}

export function useKurumHooks() {
  const [kurumData, setKurumData] = useState<KurumVerisi | null>(null)
  const [isLoadingKurum, setIsLoadingKurum] = useState(true)

  const fetchKurum = useCallback(async () => {
    setIsLoadingKurum(true)
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Kurum WHERE id = 1'
      )
      if (res.success && res.data && res.data.length > 0) {
        setKurumData(res.data[0])
      } else {
        // Fallback default
        setKurumData({
          kurum_adi: '',
          kurum_anteti: '[""]',
          limit_tipi: 'diger',
          finansman_kodu: '5',
          alt_kurum_tipi: 'belediye'
        })
      }
    } catch (err) {
      console.error('fetchKurum Error:', err)
      setKurumData(null)
    } finally {
      setIsLoadingKurum(false)
    }
  }, [])

  const saveKurum = useCallback(async (data: KurumVerisi) => {
    try {
      const keys = Object.keys(data).filter((k) => k !== 'id')
      const setClause = keys.map((k) => `${k} = ?`).join(', ')
      const values = keys.map((k) => data[k as keyof KurumVerisi])

      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE TANIM_Kurum SET ${setClause} WHERE id = 1`,
        values
      )

      if (!res.success) {
        throw new Error(res.error || 'Güncelleme hatası')
      }

      return true
    } catch (err) {
      console.error('saveKurum Error:', err)
      throw err
    }
  }, [])

  return { kurumData, isLoadingKurum, fetchKurum, saveKurum }
}
