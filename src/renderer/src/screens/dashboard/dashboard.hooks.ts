import { useState, useEffect, useCallback } from 'react'

export interface DashboardStats {
  ihaleDosyaSayisi: number
  ihalelereSecilenFirmaSayisi: number
  ihalelereKatilanFirmaSayisi: number
  ihaleEdilenMalzemeSayisi: number
  kayitliFirmaSayisi: number
  kayitliPersonelSayisi: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    ihaleDosyaSayisi: 0,
    ihalelereSecilenFirmaSayisi: 0,
    ihalelereKatilanFirmaSayisi: 0,
    ihaleEdilenMalzemeSayisi: 0,
    kayitliFirmaSayisi: 0,
    kayitliPersonelSayisi: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadStats = useCallback(async () => {
    setIsLoading(true)
    try {
      // 1. İhale dosya sayısı
      const dosyaRes = await window.electron.ipcRenderer.invoke('db:query', 'SELECT COUNT(*) as count FROM DATA_TeminDosyasi')
      const ihaleDosyaSayisi = dosyaRes.data[0]?.count || 0

      // 2. Kayıtlı Firma Sayısı
      const firmaRes = await window.electron.ipcRenderer.invoke('db:query', 'SELECT COUNT(*) as count FROM TANIM_Firma')
      const kayitliFirmaSayisi = firmaRes.data[0]?.count || 0

      // 3. Kayıtlı Personel Sayısı
      const personelRes = await window.electron.ipcRenderer.invoke('db:query', 'SELECT COUNT(*) as count FROM TANIM_Personel')
      const kayitliPersonelSayisi = personelRes.data[0]?.count || 0

      // Mock Data for unimplemented tables
      // If there's a table for items in a file, we could count them. Currently we don't have them.
      const ihaleEdilenMalzemeSayisi = 65
      const ihalelereSecilenFirmaSayisi = 60
      const ihalelereKatilanFirmaSayisi = 0

      setStats({
        ihaleDosyaSayisi,
        ihalelereSecilenFirmaSayisi,
        ihalelereKatilanFirmaSayisi,
        ihaleEdilenMalzemeSayisi,
        kayitliFirmaSayisi,
        kayitliPersonelSayisi
      })
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return { stats, isLoading, refetch: loadStats }
}

export interface ActiveDosyaSummary {
  kurumAdi: string
  kurumTuru: string
  dosyaNo: string
  konu: string
  tur: string
  birimAdi: string
  secilenFirma: string
  katilanFirmaSayisi: number
  malzemeSayisi: number
}

export function useActiveDosyaSummary(activeDosyaId: number | null, institutionName: string, institutionTypeLabel: string) {
  const [summary, setSummary] = useState<ActiveDosyaSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadSummary = useCallback(async () => {
    if (!activeDosyaId) {
      setSummary(null)
      return
    }

    setIsLoading(true)
    try {
      const q = `
        SELECT 
          d.temin_no, d.konu, d.tur,
          b.birim_adi,
          f.unvan as firma_unvani
        FROM DATA_TeminDosyasi d
        LEFT JOIN TANIM_Birim b ON d.birim_id = b.id
        LEFT JOIN TANIM_Firma f ON d.firma_id = f.id
        WHERE d.id = ?
      `
      const res = await window.electron.ipcRenderer.invoke('db:query', q, [activeDosyaId])
      
      if (res.success && res.data.length > 0) {
        const row = res.data[0]
        
        // Mocking unimplemented fields as 0 for now until tables are created
        const katilanFirmaSayisi = 0 
        const malzemeSayisi = 0

        setSummary({
          kurumAdi: institutionName,
          kurumTuru: institutionTypeLabel,
          dosyaNo: row.temin_no,
          konu: row.konu,
          tur: row.tur,
          birimAdi: row.birim_adi || 'Birim Seçilmedi',
          secilenFirma: row.firma_unvani || 'Henüz Seçilmedi',
          katilanFirmaSayisi,
          malzemeSayisi
        })
      } else {
        setSummary(null)
      }
    } catch (e) {
      console.error('Failed to load active dosya summary', e)
    } finally {
      setIsLoading(false)
    }
  }, [activeDosyaId, institutionName, institutionTypeLabel])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  return { summary, isLoading, refetch: loadSummary }
}
