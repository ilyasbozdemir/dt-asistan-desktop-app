import { SAYI_YAZI_MAP, sayiyiYaziyaCevir, paraYaziyaCevir } from '../../constants/sayiEslesmeleri'
import { getInstitutionSuffixes } from '../../utils/kurumHelper'

export function buildDocumentContext(
  dosyaResData: any,
  kalemlerData: any[],
  firms: any[],
  bidsMap: Record<string, number>,
  commission: any[],
  muayeneKomisyonu: any[],
  kurum: any,
  settings: any,
  resolvedMappings: Record<string, any>
): any {
  const subInstType = settings?.subInstitutionType || ''

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

  const today = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())

  const kalemSayisi = kalemlerData?.length || 0
  const kalemSayisiYazi = sayiyiYaziyaCevir(kalemSayisi)

  // Para birimi formatlayıcı
  const formatTR = (val: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val)
  }

  // Firma toplamlarını hesapla
  const firmaToplamlari = firms.map((f: any) => {
    let sum = 0
    kalemlerData?.forEach((k: any) => {
      const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
      sum += price * (k.miktar || 0)
    })
    return {
      toplam: formatTR(sum)
    }
  })

  const calculatedTeklifler = firms
    .map((f: any, index: number) => {
      let sum = 0
      kalemlerData?.forEach((k: any) => {
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
    })
    .sort((a: any, b: any) => a.teklifBedeliRaw - b.teklifBedeliRaw)

  const enAvantajliTeklifSahibi = calculatedTeklifler[0]?.istekliUnvani || ''
  const enAvantajliTeklifBedeli = calculatedTeklifler[0]?.teklifBedeli || ''
  const ikinciAvantajliTeklifSahibi = calculatedTeklifler[1]?.istekliUnvani || ''
  const ikinciAvantajliTeklifBedeli = calculatedTeklifler[1]?.teklifBedeli || ''

  // En düşük fiyatlar ve genel toplam hesaplama
  let grandTotal = 0
  const needItems =
    kalemlerData?.map((k: any, index: number) => {
      const itemPrices = firms.map((f: any) => ({
        unvan: f.unvan,
        price: bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
      }))
      const validPrices = itemPrices.filter((p: any) => p.price > 0)
      const minPrice =
        validPrices.length > 0 ? Math.min(...validPrices.map((p: any) => p.price)) : 0
      const toplamBedel = minPrice * (k.miktar || 0)
      grandTotal += toplamBedel

      const enUygunFirma =
        validPrices.length > 0
          ? validPrices.reduce((prev: any, curr: any) => (prev.price < curr.price ? prev : curr))
          : null
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

  const rawHarcamaBirimi = settings?.harcamaBirimAdi || dosyaResData?.harcama_birimi || ''
  const parentInstitutionName = settings?.parentInstitution || ''
  const institutionName = settings?.institutionName || 'Kurum Adı Belirtilmedi'
  const idareAdi = rawHarcamaBirimi ? `${institutionName} - ${rawHarcamaBirimi}` : institutionName

  const rawTur = dosyaResData?.tur || 'mal'
  let alimTuruText = 'Mal Alımı'
  if (rawTur === 'hizmet') alimTuruText = 'Hizmet Alımı'
  else if (rawTur === 'yapim_isi' || rawTur === 'yapim') alimTuruText = 'Yapım İşi'
  else if (rawTur === 'danismanlik') alimTuruText = 'Danışmanlık Hizmet Alımı'

  const rawButceKodu = dosyaResData?.butce_kodu || ''
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

  const dbYaklasikMaliyet = dosyaResData?.yaklasik_maliyet || 0
  const yaklasikMaliyetText = dbYaklasikMaliyet > 0 ? formatTR(dbYaklasikMaliyet) : '0,00'

  const teminSekliText =
    dosyaResData?.ihale_sekli || "4734 sayılı Kanun'un 22/d maddesi gereğince Doğrudan Temin"

  const rawKapakDetaylari: any[] = []
  if (dosyaResData?.konu) {
    rawKapakDetaylari.push({ label: 'İŞİN ADI', value: dosyaResData.konu, isBold: true })
  }
  if (dosyaResData?.isin_aciklamasi) {
    rawKapakDetaylari.push({ label: 'İŞİN AÇIKLAMASI', value: dosyaResData.isin_aciklamasi })
  }
  rawKapakDetaylari.push({ label: 'İŞİN TÜRÜ', value: alimTuruText })
  if (dosyaResData?.temin_no) {
    rawKapakDetaylari.push({ label: 'TEMİN NUMARASI', value: dosyaResData.temin_no })
  }
  if (dbYaklasikMaliyet > 0) {
    rawKapakDetaylari.push({ label: 'YAKLAŞIK MALİYET', value: `${yaklasikMaliyetText} TL` })
  }
  if (butceTertibiArray && butceTertibiArray.length > 0) {
    rawKapakDetaylari.push({ label: 'BÜTÇE TERTİBİ', value: butceTertibiArray })
  }
  if (dosyaResData?.yuklenici_firma_adi) {
    rawKapakDetaylari.push({
      label: 'İHALEYİ ALAN FİRMA',
      value: dosyaResData.yuklenici_firma_adi,
      isBold: true
    })
  }
  if (dosyaResData?.tarih) {
    rawKapakDetaylari.push({ label: 'DOSYA TARİHİ', value: dosyaResData.tarih })
  }

  const kapakDetaylari = rawKapakDetaylari.map((item) => ({
    label: item.label,
    lines: Array.isArray(item.value) ? item.value : [item.value],
    isBold: item.isBold || false
  }))

  // evrakSayisi formatting: detsisno-yil-sayisi
  const detsisNo = kurum?.detsis_kodu || ''
  const dosyaYili =
    dosyaResData?.butce_yili ||
    (dosyaResData?.tarih ? dosyaResData.tarih.split('.')[2] : new Date().getFullYear())
  const dosyaSayisi = dosyaResData?.temin_no || ''

  let formattedEvrakSayisi = 'Belirtilmedi'
  if (detsisNo) {
    if (dosyaYili && dosyaSayisi) {
      const cleanSayi = dosyaSayisi.includes('/')
        ? dosyaSayisi.split('/').pop()
        : dosyaSayisi.includes('-')
          ? dosyaSayisi.split('-').pop()
          : dosyaSayisi
      formattedEvrakSayisi = `${detsisNo}-${dosyaYili}-${cleanSayi}`
    } else {
      formattedEvrakSayisi = detsisNo
    }
  } else if (dosyaSayisi) {
    formattedEvrakSayisi = dosyaSayisi
  }

  const context: any = {
    kapakDetaylari,
    tarih: today,
    alimTuru: alimTuruText,
    dosyaTarihi: dosyaResData?.tarih || today,
    yukleniciFirma: dosyaResData?.yuklenici_firma_adi || null,
    yukleniciAdresi: dosyaResData?.yuklenici_firma_adresi || '',
    yukleniciIlce: dosyaResData?.yuklenici_firma_ilcesi || '',
    yukleniciIl: dosyaResData?.yuklenici_firma_ili || '',
    yukleniciTelefon: dosyaResData?.yuklenici_firma_telefon || '',
    yukleniciFaks: dosyaResData?.yuklenici_firma_faks || '',
    yukleniciEposta: dosyaResData?.yuklenici_firma_email || '',
    yukleniciVergiDairesi: dosyaResData?.yuklenici_firma_vergi_dairesi || '',
    yukleniciVergiNo: dosyaResData?.yuklenici_firma_vergi_no || '',
    idareAdresi: kurum?.adres || settings?.kurumAdres || 'İdare Adresi Belirtilmedi',
    idareTelefon: kurum?.telefon || settings?.kurumTelefon || 'Telefon Belirtilmedi',
    idareEposta: kurum?.eposta || settings?.kurumEposta || 'E-posta Belirtilmedi',
    kurumAdres: kurum?.adres || settings?.kurumAdres || '',
    kurumTelefon: kurum?.telefon || settings?.kurumTelefon || '',
    kurumEposta: kurum?.eposta || settings?.kurumEposta || '',
    kurumKep: kurum?.kep_adresi || '',
    kurumWeb: kurum?.web_sitesi || '',
    kurumIci: false,
    evrakSayisi: formattedEvrakSayisi,
    dosyaKonusu: dosyaResData?.konu || 'Konu Belirtilmedi',
    isAdi: dosyaResData?.konu || 'Konu Belirtilmedi',
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
    baskanAdi: dosyaResData?.onaylayan_ad_soyad || 'Harcama Yetkilisi Belirtilmedi',
    baskanUnvan: dosyaResData?.onaylayan_unvan || 'Harcama Yetkilisi',
    teminNo: dosyaResData?.temin_no || 'Belirtilmedi',
    teminSekli: teminSekliText,
    yaklasikMaliyet: yaklasikMaliyetText,
    odenekTutari: settings?.kullanilabilirOdenek || '500.000,00 TL',
    projeNo: dosyaResData?.yatirim_proje_no || 'Yok',
    butceTertibi: butceTertibiArray,
    butceKodu: rawButceKodu || 'Belirtilmedi',
    avansSartlari:
      dosyaResData?.avans_verilecek_mi === 1 ? 'Avans verilecektir.' : 'Avans verilmeyecek',
    fiyatFarkiSartlari: dosyaResData?.fiyat_farki_dayanagi || 'Fiyat Farkı Ödenmeyecek',
    dokumanHazirlik: 'Hazırlanmayacaktır.',
    isinAciklamasi: dosyaResData?.isin_aciklamasi || dosyaResData?.konu || 'Belirtilmedi',
    onaylayanPersonelAdi: dosyaResData?.onaylayan_ad_soyad || 'Harcama Yetkilisi Belirtilmedi',
    onaylayanPersonelUnvan: dosyaResData?.onaylayan_unvan || 'Harcama Yetkilisi',
    onaylayanlar: [
      {
        onaylayanPersonelAdi: dosyaResData?.onaylayan_ad_soyad || 'Harcama Yetkilisi Belirtilmedi',
        onaylayanPersonelUnvan: dosyaResData?.onaylayan_unvan || 'Harcama Yetkilisi'
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
    hazirlayanPersonelAdi: dosyaResData?.hazirlayan_ad_soyad || 'Görevli Personel',
    hazirlayanPersonelUnvan: dosyaResData?.hazirlayan_unvan || 'Unvan Belirtilmedi',
    talepEdenPersonelAdi: dosyaResData?.talep_eden_ad_soyad || 'Belirtilmedi',
    talepEdenPersonelUnvan: dosyaResData?.talep_eden_unvan || '',
    sunanPersonelAdi: dosyaResData?.sunan_ad_soyad || 'Belirtilmedi',
    sunanPersonelUnvan: dosyaResData?.sunan_unvan || '',
    ilgiliPersonelAdi: dosyaResData?.irtibat_ad_soyad || 'Belirtilmedi',
    ilgiliPersonelUnvan: dosyaResData?.irtibat_unvan || '',
    firmalar: firms.map((f: any) => ({ unvan: f.unvan })),
    firmalarColspan: firms.length + 2,
    firmaToplamlari,
    firmaToplamlariDetay: firmaToplamlari,
    genelToplam,
    genelToplamYazi: paraYaziyaCevir(grandTotal),
    sozlesmeBedeli: genelToplam,
    sozlesmeBedeliYazi: paraYaziyaCevir(grandTotal),
    pulBedeli: formatTR(grandTotal * 0.00948),
    teklifler: calculatedTeklifler,
    enAvantajliTeklifSahibi,
    enAvantajliTeklifBedeli,
    ikinciAvantajliTeklifSahibi,
    ikinciAvantajliTeklifBedeli,
    ihaleKomisyonu: commission.map((c: any) => ({
      adSoyad: c.ad_soyad,
      unvan: c.unvan,
      gorevi: c.gorevi
    })),
    ...resolvedMappings
  }

  // Sadece mapping dosyasında tanımlıysa şablona gönderilsin
  if (
    resolvedMappings.antetSatirlari !== undefined &&
    (resolvedMappings.antetSatirlari === null ||
      String(resolvedMappings.antetSatirlari).startsWith('[Belirtilmedi'))
  ) {
    context.antetSatirlari = antetSatirlari
  } else if (resolvedMappings.antetSatirlari !== undefined) {
    context.antetSatirlari = resolvedMappings.antetSatirlari
  }

  if (
    resolvedMappings.ihtiyacKalemleri !== undefined &&
    (resolvedMappings.ihtiyacKalemleri === null ||
      String(resolvedMappings.ihtiyacKalemleri).startsWith('[Belirtilmedi'))
  ) {
    context.ihtiyacKalemleri = needItems
  } else if (resolvedMappings.ihtiyacKalemleri !== undefined) {
    context.ihtiyacKalemleri = resolvedMappings.ihtiyacKalemleri
  }

  return context
}
