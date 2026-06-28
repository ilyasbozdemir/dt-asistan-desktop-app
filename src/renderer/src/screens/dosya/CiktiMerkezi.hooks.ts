import { useState, useEffect } from 'react'
import { Sablon } from '../sablonlar/sablonlar.hooks'
import { subPagesMapping } from '../../constants/surecler'
import { getDefaultMappingForProcess, ProcessMapping } from '../../constants/mappings'
import { buildDocumentContext } from './CiktiMerkezi.contextBuilder'

export function useCiktiMerkeziData(activeDosyaId: number | null) {
  const [sablons, setSablons] = useState<Sablon[]>([])
  const [loading, setLoading] = useState(true)
  const [masterHtml, setMasterHtml] = useState('')
  const [dosyaContext, setDosyaContext] = useState<any>({})
  const [activeDosya, setActiveDosya] = useState<any>(null)
  const [placeholders, setPlaceholders] = useState<any[]>([])

  useEffect(() => {
    if (!activeDosyaId) return

    const loadData = async (isBackgroundRefresh = false) => {
      if (!activeDosyaId) return
      if (!isBackgroundRefresh) setLoading(true)
      try {
        // Master HTML'i al
        const mHtml = await window.electron.ipcRenderer.invoke(
          'template:read-system',
          'master.html'
        )
        if (typeof mHtml === 'string') setMasterHtml(mHtml)

        // Şablonları al (sadece en güncel versiyonlar)
        const sablonsRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Sablon WHERE id IN (SELECT MAX(id) FROM TANIM_Sablon WHERE aktif_mi = 1 GROUP BY COALESCE(parent_id, id)) ORDER BY kategori ASC, ad ASC'
        )
        if (sablonsRes.success) setSablons(sablonsRes.data)

        // Dinamik Değişken Tanımlarını Çek (TANIM_Placeholder)
        const placeholdersRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Placeholder'
        )
        if (placeholdersRes.success) {
          setPlaceholders(placeholdersRes.data)
        }

        // Aktif dosya verisini al (Temel dosya bilgisi, onaylayan personel ve kalemler)
        const dosyaRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT d.*, 
                  p.ad_soyad as onaylayan_ad_soyad, p.unvan as onaylayan_unvan,
                  h.ad_soyad as hazirlayan_ad_soyad, h.unvan as hazirlayan_unvan,
                  h.telefon as hazirlayan_telefon, h.eposta as hazirlayan_eposta,
                  te.ad_soyad as talep_eden_ad_soyad, te.unvan as talep_eden_unvan,
                  su.ad_soyad as sunan_ad_soyad, su.unvan as sunan_unvan,
                  iy.ad_soyad as irtibat_ad_soyad, iy.unvan as irtibat_unvan,
                  f.unvan as yuklenici_firma_adi,
                  f.adres as yuklenici_firma_adresi,
                  f.ilce as yuklenici_firma_ilcesi,
                  f.il as yuklenici_firma_ili,
                  f.telefon as yuklenici_firma_telefon,
                  f.faks as yuklenici_firma_faks,
                  f.email as yuklenici_firma_email,
                  f.vergi_dairesi as yuklenici_firma_vergi_dairesi,
                  f.vergi_no as yuklenici_firma_vergi_no
           FROM DATA_TeminDosyasi d 
           LEFT JOIN TANIM_Personel p ON d.onay_personel_id = p.id 
           LEFT JOIN TANIM_Personel h ON d.hazirlayan_personel_id = h.id
           LEFT JOIN TANIM_Personel te ON d.talep_eden_personel_id = te.id
           LEFT JOIN TANIM_Personel su ON d.sunan_personel_id = su.id
           LEFT JOIN TANIM_Personel iy ON d.irtibat_yetkilisi_id = iy.id
           LEFT JOIN TANIM_Firma f ON d.firma_id = f.id
           WHERE d.id = ?`,
          [activeDosyaId]
        )
        const kalemlerRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
          [activeDosyaId]
        )

        // Firmaları çek (DATA_TeminFirma ve TANIM_Firma birleşimi)
        const firmsRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT df.id as temin_firma_id, f.unvan, f.id as firma_id 
           FROM DATA_TeminFirma df 
           JOIN TANIM_Firma f ON df.firma_id = f.id 
           WHERE df.temin_dosya_id = ?`,
          [activeDosyaId]
        )
        const firms = firmsRes.success ? firmsRes.data : []

        // Teklifleri çek
        const bidsRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?',
          [activeDosyaId]
        )
        const bids = bidsRes.success ? bidsRes.data : []
        const bidsMap: Record<string, number> = {}
        bids.forEach((b: any) => {
          bidsMap[`${b.temin_kalem_id}_${b.temin_firma_id}`] = b.birim_fiyat || 0
        })

        // Komisyon üyelerini çek
        const komsRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT tk.*, p.ad_soyad, p.unvan 
           FROM DATA_TeminKomisyon tk 
           JOIN TANIM_Personel p ON tk.personel_id = p.id 
           WHERE tk.temin_dosya_id = ?`,
          [activeDosyaId]
        )
        const allCommission = komsRes.success ? komsRes.data : []
        const commission = allCommission.filter((c: any) => c.komisyon_turu === 'Fiyat Araştırma')
        const muayeneKomisyonu = allCommission.filter(
          (c: any) => c.komisyon_turu === 'Muayene Kabul'
        )

        const settings = await window.electron.ipcRenderer.invoke('db:get-settings')
        const subInstType = settings?.subInstitutionType || ''

        // TANIM_Kurum'dan kurum bilgilerini al (yeni tablo)
        const kurumRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Kurum WHERE id = 1'
        )
        const kurum = kurumRes.success && kurumRes.data?.length > 0 ? kurumRes.data[0] : null

        // Antet satırlarını parse et
        let antetSatirlari: string[] = []
        if (kurum?.kurum_anteti) {
          try {
            const parsed = JSON.parse(kurum.kurum_anteti)
            if (Array.isArray(parsed)) {
              antetSatirlari = parsed.filter((s: string) => s && s.trim() !== '')
            }
          } catch {
            antetSatirlari = kurum.kurum_anteti ? [kurum.kurum_anteti] : []
          }
        }

        // Dynamic mapping resolver
        const resolvedMappings: Record<string, any> = {}
        for (const process of subPagesMapping) {
          const defaultMap = getDefaultMappingForProcess(process.path)
          const overridesKey = `MAPPING_${process.path}_PLACEHOLDERS`
          let overriddenMap: ProcessMapping = {}
          if (settings && settings[overridesKey]) {
            try {
              overriddenMap = JSON.parse(settings[overridesKey])
            } catch {
              // Hata durumunda varsayılan boş eşleme kalır
            }
          }
          const activeMap = { ...defaultMap, ...overriddenMap }

          for (const [sablonKey, colMap] of Object.entries(activeMap)) {
            if (colMap) {
              let val: any = null

              if (colMap.deger !== undefined) {
                val = colMap.deger
              } else if (colMap.formul) {
                val = colMap.formul.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
                  const parts = path.trim().split('.')
                  if (parts.length === 2) {
                    const [tbl, col] = parts
                    if (tbl === 'TANIM_Kurum' && kurum) {
                      return kurum[col] !== undefined && kurum[col] !== null
                        ? String(kurum[col])
                        : ''
                    }
                    if (tbl === 'DATA_TeminDosyasi' && dosyaRes.data?.[0]) {
                      if (col === 'temin_no_clean') {
                        const rawNo = dosyaRes.data[0].temin_no || ''
                        return rawNo.includes('/')
                          ? rawNo.split('/').pop()
                          : rawNo.includes('-')
                            ? rawNo.split('-').pop()
                            : rawNo
                      }
                      return dosyaRes.data[0][col] !== undefined && dosyaRes.data[0][col] !== null
                        ? String(dosyaRes.data[0][col])
                        : ''
                    }
                  }
                  return match
                })
              } else if (colMap.tablo && colMap.sutun) {
                if (colMap.iliskili_id) {
                  // Dynamic query filtered by activeDosyaId
                  try {
                    const queryStr =
                      colMap.sutun === '*'
                        ? `SELECT * FROM ${colMap.tablo} WHERE ${colMap.iliskili_id} = ?`
                        : `SELECT ${colMap.sutun} FROM ${colMap.tablo} WHERE ${colMap.iliskili_id} = ? LIMIT 1`

                    const dynamicRes = await window.electron.ipcRenderer.invoke(
                      'db:query',
                      queryStr,
                      [activeDosyaId]
                    )
                    if (dynamicRes.success && dynamicRes.data) {
                      if (colMap.sutun === '*') {
                        let rows = dynamicRes.data
                        if (colMap.altEslestirme && Array.isArray(rows)) {
                          rows = rows.map((row: any, idx: number) => {
                            const mapped: any = { siraNo: idx + 1 }
                            for (const [mustacheKey, dbCol] of Object.entries(
                              colMap.altEslestirme!
                            )) {
                              mapped[mustacheKey] = row[dbCol]
                            }
                            return mapped
                          })
                        }
                        val = rows
                      } else {
                        val = dynamicRes.data[0]?.[colMap.sutun]
                      }
                    }
                  } catch {
                    // Hata durumunda val null kalır
                  }
                } else if (colMap.tablo === 'TANIM_Kurum' && kurum) {
                  val = kurum[colMap.sutun as keyof typeof kurum]
                } else if (colMap.tablo === 'DATA_TeminDosyasi' && dosyaRes.data?.[0]) {
                  val = dosyaRes.data[0][colMap.sutun]
                }
              }

              if (val === null || val === undefined || val === '') {
                val =
                  colMap.varsayilan !== undefined
                    ? colMap.varsayilan
                    : `[Belirtilmedi: ${colMap.aciklama || sablonKey}]`
              }

              if (val !== null && val !== undefined) {
                if (
                  typeof val === 'string' &&
                  ((val.startsWith('[') && val.endsWith(']')) ||
                    (val.startsWith('{') && val.endsWith('}')))
                ) {
                  try {
                    val = JSON.parse(val)
                  } catch {
                    // JSON formatında değilse ham string olarak kalır
                  }
                }
                resolvedMappings[sablonKey] = val
              }
            }
          }
        }

        let context = buildDocumentContext(
          dosyaRes.data?.[0],
          kalemlerRes.data || [],
          firms,
          bidsMap,
          commission,
          muayeneKomisyonu,
          kurum,
          settings,
          resolvedMappings
        )

        // Varsa test/master dummy verisini de alıp birleştir, gerçek veriler üzerine yazsın
        const mJson = await window.electron.ipcRenderer.invoke(
          'template:read-system',
          'master.html.json'
        )
        if (typeof mJson === 'string') {
          try {
            const parsedJson = JSON.parse(mJson)
            context = { ...parsedJson, ...context }
          } catch {
            // Hata durumunda master.html.json yok sayılır
          }
        }

        setDosyaContext(context)
        setActiveDosya(dosyaRes.data?.[0] || null)
      } catch (err) {
        console.error('Veri yükleme hatası:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    const unlisten = window.electron.ipcRenderer.on('db:invalidated', () => {
      loadData(true)
    })

    return () => {
      if (unlisten) unlisten()
    }
  }, [activeDosyaId])

  return { sablons, loading, masterHtml, dosyaContext, activeDosya, placeholders }
}
