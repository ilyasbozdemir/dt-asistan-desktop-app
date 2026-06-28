import { useState, useEffect } from 'react'
import { SAYI_YAZI_MAP, sayiyiYaziyaCevir, paraYaziyaCevir } from '../../constants/sayiEslesmeleri'
import { getInstitutionSuffixes } from '../../utils/kurumHelper'
import { Sablon } from '../sablonlar/sablonlar.hooks'
import { subPagesMapping } from '../../constants/surecler'
import { getDefaultMappingForProcess, ProcessMapping } from '../../constants/mappings'

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
      const mHtml = await window.electron.ipcRenderer.invoke('template:read-system', 'master.html')
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
        const muayeneKomisyonu = allCommission.filter((c: any) => c.komisyon_turu === 'Muayene Kabul')

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

        const suffixes = getInstitutionSuffixes(subInstType, {
          label: settings?.customSubInstitutionLabel,
          kurumumuz: settings?.customSubInstitutionKurumumuz,
          kurumunuz: settings?.customSubInstitutionKurumumuz,
          kurumu: settings?.customSubInstitutionKurumu,
          kurumlari: settings?.customSubInstitutionKurumlari
        })

        const today = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

        const kalemSayisi = kalemlerRes.data?.length || 0
        const kalemSayisiYazi = sayiyiYaziyaCevir(kalemSayisi)

        // Para birimi formatlayıcı
        const formatTR = (val: number) => {
          return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)
        }

        // Firma toplamlarını hesapla
        const firmaToplamlari = firms.map((f: any) => {
          let sum = 0
          kalemlerRes.data?.forEach((k: any) => {
            const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
            sum += price * (k.miktar || 0)
          })
          return {
            toplam: formatTR(sum)
          }
        })

        const calculatedTeklifler = firms.map((f: any, index: number) => {
          let sum = 0
          kalemlerRes.data?.forEach((k: any) => {
            const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
            sum += price * (k.miktar || 0)
          })
          return {
            siraNo: index + 1,
            istekliUnvani: f.unvan,
            teklifBedeli: formatTR(sum),
            teklifBedeliRaw: sum,
            yaziIle: paraYaziyaCevir(sum)
          }
        }).sort((a: any, b: any) => a.teklifBedeliRaw - b.teklifBedeliRaw)

        const enAvantajliTeklifSahibi = calculatedTeklifler[0]?.istekliUnvani || ''
        const enAvantajliTeklifBedeli = calculatedTeklifler[0]?.teklifBedeli || ''
        const ikinciAvantajliTeklifSahibi = calculatedTeklifler[1]?.istekliUnvani || ''
        const ikinciAvantajliTeklifBedeli = calculatedTeklifler[1]?.teklifBedeli || ''

        // En düşük fiyatlar ve genel toplam hesaplama
        let grandTotal = 0
        const needItems = kalemlerRes.data?.map((k: any, index: number) => {
          const itemPrices = firms.map((f: any) => ({
            unvan: f.unvan,
            price: bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
          }))
          const validPrices = itemPrices.filter((p: any) => p.price > 0)
          const minPrice = validPrices.length > 0 ? Math.min(...validPrices.map((p: any) => p.price)) : 0
          const toplamBedel = minPrice * (k.miktar || 0)
          grandTotal += toplamBedel

          const enUygunFirma = validPrices.length > 0 ? validPrices.reduce((prev: any, curr: any) => prev.price < curr.price ? prev : curr) : null
          const enUygunFirmaAdi = enUygunFirma ? enUygunFirma.unvan : 'Teklif Yok'

          const firmaTeklifleri = firms.map((f: any) => {
            const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
            return {
              fiyat: price > 0 ? formatTR(price) : '-'
            }
          })

          const firmaTeklifleriDetay = firms.map((f: any) => {
            const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
            const total = price * (k.miktar || 0)
            return {
              birimFiyat: price > 0 ? formatTR(price) : '-',
              tutar: total > 0 ? formatTR(total) : '-',
              hasPrice: price > 0
            }
          })

          return {
            siraNo: index + 1,
            kodu: k.tasinir_kodu || k.okas_kodu || '-',
            malzemeAdi: k.kalem_adi,
            ozelligi: k.aciklama || '',
            birimi: k.birim,
            kdvOrani: k.kdv_orani,
            miktar: formatTR(k.miktar || 0),
            firmaTeklifleri,
            firmaTeklifleriDetay,
            enUygunFirmaAdi,
            enDusukFiyat: minPrice > 0 ? formatTR(minPrice) : '-',
            toplamBedel: toplamBedel > 0 ? formatTR(toplamBedel) : '-'
          }
        }) || []

        const genelToplam = formatTR(grandTotal)

        const rawHarcamaBirimi = settings?.harcamaBirimAdi || dosyaRes.data?.[0]?.harcama_birimi || ''
        const parentInstitutionName = settings?.parentInstitution || ''
        const institutionName = settings?.institutionName || 'Kurum Adı Belirtilmedi'
        const idareAdi = rawHarcamaBirimi ? `${institutionName} - ${rawHarcamaBirimi}` : institutionName

        const rawTur = dosyaRes.data?.[0]?.tur || 'mal'
        let alimTuruText = 'Mal Alımı'
        if (rawTur === 'hizmet') alimTuruText = 'Hizmet Alımı'
        else if (rawTur === 'yapim_isi' || rawTur === 'yapim') alimTuruText = 'Yapım İşi'
        else if (rawTur === 'danismanlik') alimTuruText = 'Danışmanlık Hizmet Alımı'

        const rawButceKodu = dosyaRes.data?.[0]?.butce_kodu || ''
        const butceTertibiArray = rawButceKodu
          .split(/[\n,;]+/)
          .map((item: string) => item.trim())
          .filter((item: string) => item.length > 0)
          .map((item: string) => {
            let cleanItem = item
            if (cleanItem.startsWith('630.')) {
              cleanItem = cleanItem.substring(4)
            } else if (cleanItem.startsWith('630')) {
              cleanItem = cleanItem.substring(3)
            }
            return cleanItem
          })

        const dbYaklasikMaliyet = dosyaRes.data?.[0]?.yaklasik_maliyet || 0
        const yaklasikMaliyetText = dbYaklasikMaliyet > 0 ? formatTR(dbYaklasikMaliyet) : '0,00'

        const teminSekliText = dosyaRes.data?.[0]?.ihale_sekli || '4734 sayılı Kanun\'un 22/d maddesi gereğince Doğrudan Temin'

        const rawKapakDetaylari: any[] = []
        if (dosyaRes.data?.[0]?.konu) {
          rawKapakDetaylari.push({ label: 'İŞİN ADI', value: dosyaRes.data[0].konu, isBold: true })
        }
        if (dosyaRes.data?.[0]?.isin_aciklamasi) {
          rawKapakDetaylari.push({ label: 'İŞİN AÇIKLAMASI', value: dosyaRes.data[0].isin_aciklamasi })
        }
        rawKapakDetaylari.push({ label: 'İŞİN TÜRÜ', value: alimTuruText })
        if (dosyaRes.data?.[0]?.temin_no) {
          rawKapakDetaylari.push({ label: 'TEMİN NUMARASI', value: dosyaRes.data[0].temin_no })
        }
        if (dbYaklasikMaliyet > 0) {
          rawKapakDetaylari.push({ label: 'YAKLAŞIK MALİYET', value: `${yaklasikMaliyetText} TL` })
        }
        if (butceTertibiArray && butceTertibiArray.length > 0) {
          rawKapakDetaylari.push({ label: 'BÜTÇE TERTİBİ', value: butceTertibiArray })
        }
        if (dosyaRes.data?.[0]?.yuklenici_firma_adi) {
          rawKapakDetaylari.push({ label: 'İHALEYİ ALAN FİRMA', value: dosyaRes.data[0].yuklenici_firma_adi, isBold: true })
        }
        if (dosyaRes.data?.[0]?.tarih) {
          rawKapakDetaylari.push({ label: 'DOSYA TARİHİ', value: dosyaRes.data[0].tarih })
        }

        const kapakDetaylari = rawKapakDetaylari.map((item) => ({
          label: item.label,
          lines: Array.isArray(item.value) ? item.value : [item.value],
          isBold: item.isBold || false
        }))

        // Dynamic mapping resolver
        const resolvedMappings: Record<string, any> = {}
        for (const process of subPagesMapping) {
          const defaultMap = getDefaultMappingForProcess(process.path)
          const overridesKey = `MAPPING_${process.path}_PLACEHOLDERS`
          let overriddenMap: ProcessMapping = {}
          if (settings && settings[overridesKey]) {
            try {
              overriddenMap = JSON.parse(settings[overridesKey])
            } catch (e) {}
          }
          const activeMap = { ...defaultMap, ...overriddenMap }

          for (const [sablonKey, colMap] of Object.entries(activeMap)) {
            if (colMap && colMap.tablo && colMap.sutun) {
              let val: any = null
              
              if (colMap.iliskili_id) {
                // Dynamic query filtered by activeDosyaId
                try {
                  const dynamicRes = await window.electron.ipcRenderer.invoke(
                    'db:query',
                    `SELECT ${colMap.sutun} FROM ${colMap.tablo} WHERE ${colMap.iliskili_id} = ? LIMIT 1`,
                    [activeDosyaId]
                  )
                  if (dynamicRes.success && dynamicRes.data?.length > 0) {
                    val = dynamicRes.data[0][colMap.sutun]
                  }
                } catch (err) {
                  console.error(`Dynamic mapping query failed for ${sablonKey}:`, err)
                }
              } else if (colMap.tablo === 'TANIM_Kurum' && kurum) {
                val = kurum[colMap.sutun as keyof typeof kurum]
              } else if (colMap.tablo === 'DATA_TeminDosyasi' && dosyaRes.data?.[0]) {
                val = dosyaRes.data[0][colMap.sutun]
              }
              
              if (val !== null && val !== undefined) {
                if (typeof val === 'string' && ((val.startsWith('[') && val.endsWith(']')) || (val.startsWith('{') && val.endsWith('}')))) {
                  try {
                    val = JSON.parse(val)
                  } catch (e) {}
                }
                resolvedMappings[sablonKey] = val
              }
            }
          }
        }

        let context: any = {
          ...resolvedMappings,
          kapakDetaylari,
          tarih: today,
          alimTuru: alimTuruText,
          dosyaTarihi: dosyaRes.data?.[0]?.tarih || today,
          yukleniciFirma: dosyaRes.data?.[0]?.yuklenici_firma_adi || null,
          yukleniciAdresi: dosyaRes.data?.[0]?.yuklenici_firma_adresi || '',
          yukleniciIlce: dosyaRes.data?.[0]?.yuklenici_firma_ilcesi || '',
          yukleniciIl: dosyaRes.data?.[0]?.yuklenici_firma_ili || '',
          yukleniciTelefon: dosyaRes.data?.[0]?.yuklenici_firma_telefon || '',
          yukleniciFaks: dosyaRes.data?.[0]?.yuklenici_firma_faks || '',
          yukleniciEposta: dosyaRes.data?.[0]?.yuklenici_firma_email || '',
          yukleniciVergiDairesi: dosyaRes.data?.[0]?.yuklenici_firma_vergi_dairesi || '',
          yukleniciVergiNo: dosyaRes.data?.[0]?.yuklenici_firma_vergi_no || '',
          idareAdresi: kurum?.adres || settings?.kurumAdres || 'İdare Adresi Belirtilmedi',
          idareTelefon: kurum?.telefon || settings?.kurumTelefon || 'Telefon Belirtilmedi',
          idareEposta: kurum?.eposta || settings?.kurumEposta || 'E-posta Belirtilmedi',
          kurumAdres: kurum?.adres || settings?.kurumAdres || '',
          kurumTelefon: kurum?.telefon || settings?.kurumTelefon || '',
          kurumEposta: kurum?.eposta || settings?.kurumEposta || '',
          kurumKep: kurum?.kep_adresi || '',
          kurumWeb: kurum?.web_sitesi || '',
          antetSatirlari,
          kurumIci: false,
          evrakSayisi: dosyaRes.data?.[0]?.temin_no || 'Belirtilmedi',
          dosyaKonusu: dosyaRes.data?.[0]?.konu || 'Konu Belirtilmedi',
          isAdi: dosyaRes.data?.[0]?.konu || 'Konu Belirtilmedi',
          sayiYazıyla: SAYI_YAZI_MAP,
          kurumumuz: suffixes.kurumumuz,
          kurumunuz: suffixes.kurumunuz,
          kurumu: suffixes.kurumu,
          kurumlari: suffixes.kurumlari,
          kalemSayisi,
          kalemSayisiYazi,
          solLogo: settings?.logoLeft || null,
          sagLogo: settings?.logoRight || null,
          kurumUst: parentInstitutionName,
          kurumAdi: institutionName,
          mudurluk: rawHarcamaBirimi,
          idareAdi: idareAdi,
          baskanAdi: dosyaRes.data?.[0]?.onaylayan_ad_soyad || 'Harcama Yetkilisi Belirtilmedi',
          baskanUnvan: dosyaRes.data?.[0]?.onaylayan_unvan || 'Harcama Yetkilisi',
          teminNo: dosyaRes.data?.[0]?.temin_no || 'Belirtilmedi',
          teminSekli: teminSekliText,
          yaklasikMaliyet: yaklasikMaliyetText,
          odenekTutari: settings?.kullanilabilirOdenek || '500.000,00 TL',
          projeNo: dosyaRes.data?.[0]?.yatirim_proje_no || 'Yok',
          butceTertibi: butceTertibiArray,
          butceKodu: rawButceKodu || 'Belirtilmedi',
          avansSartlari: dosyaRes.data?.[0]?.avans_verilecek_mi === 1 ? 'Avans verilecektir.' : 'Avans verilmeyecek',
          fiyatFarkiSartlari: dosyaRes.data?.[0]?.fiyat_farki_dayanagi || 'Fiyat Farkı Ödenmeyecek',
          dokumanHazirlik: 'Hazırlanmayacaktır.',
          isinAciklamasi: dosyaRes.data?.[0]?.isin_aciklamasi || dosyaRes.data?.[0]?.konu || 'Belirtilmedi',
          onaylayanPersonelAdi: dosyaRes.data?.[0]?.onaylayan_ad_soyad || 'Harcama Yetkilisi Belirtilmedi',
          onaylayanPersonelUnvan: dosyaRes.data?.[0]?.onaylayan_unvan || 'Harcama Yetkilisi',
          onaylayanlar: [
            {
              onaylayanPersonelAdi: dosyaRes.data?.[0]?.onaylayan_ad_soyad || 'Harcama Yetkilisi Belirtilmedi',
              onaylayanPersonelUnvan: dosyaRes.data?.[0]?.onaylayan_unvan || 'Harcama Yetkilisi'
            }
          ],
          komisyon: commission.map((c: any) => ({
            adSoyad: c.ad_soyad,
            unvan: c.unvan,
            gorevi: c.gorevi
          })),
          fiyatKomisyonu: commission.map((c: any) => ({
            adSoyad: c.ad_soyad,
            unvan: c.unvan,
            gorevi: c.gorevi
          })),
          muayeneKomisyonu: muayeneKomisyonu.map((c: any) => ({
            adSoyad: c.ad_soyad,
            unvan: c.unvan,
            gorevi: c.gorevi
          })),
          hazirlayanPersonelAdi: dosyaRes.data?.[0]?.hazirlayan_ad_soyad || 'Görevli Personel',
          hazirlayanPersonelUnvan: dosyaRes.data?.[0]?.hazirlayan_unvan || 'Unvan Belirtilmedi',
          talepEdenPersonelAdi: dosyaRes.data?.[0]?.talep_eden_ad_soyad || 'Belirtilmedi',
          talepEdenPersonelUnvan: dosyaRes.data?.[0]?.talep_eden_unvan || '',
          sunanPersonelAdi: dosyaRes.data?.[0]?.sunan_ad_soyad || 'Belirtilmedi',
          sunanPersonelUnvan: dosyaRes.data?.[0]?.sunan_unvan || '',
          ilgiliPersonelAdi: dosyaRes.data?.[0]?.irtibat_ad_soyad || 'Belirtilmedi',
          ilgiliPersonelUnvan: dosyaRes.data?.[0]?.irtibat_unvan || '',
          firmalar: firms.map((f: any) => ({ unvan: f.unvan })),
          firmalarColspan: firms.length + 2,
          firmaToplamlari,
          firmaToplamlariDetay: firmaToplamlari,
          genelToplam,
          genelToplamYazi: paraYaziyaCevir(grandTotal),
          sozlesmeBedeli: genelToplam,
          sozlesmeBedeliYazi: paraYaziyaCevir(grandTotal),
          pulBedeli: formatTR(grandTotal * 0.00948),
          ihtiyacKalemleri: needItems,
          teklifler: calculatedTeklifler,
          enAvantajliTeklifSahibi,
          enAvantajliTeklifBedeli,
          ikinciAvantajliTeklifSahibi,
          ikinciAvantajliTeklifBedeli,
          ihaleKomisyonu: commission.map((c: any) => ({
            adSoyad: c.ad_soyad,
            unvan: c.unvan,
            gorevi: c.gorevi
          }))
        }

        // Varsa test/master dummy verisini de alıp birleştir, gerçek veriler üzerine yazsın
        const mJson = await window.electron.ipcRenderer.invoke('template:read-system', 'master.html.json')
        if (typeof mJson === 'string') {
          try {
            const parsedJson = JSON.parse(mJson)
            context = { ...parsedJson, ...context }
          } catch (e) {}
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
