export interface SubInstOption {
  value: string
  label: string
}

export interface InstitutionSuffixes {
  label: string
  kurumumuz: string // 1st person plural (bizim)
  kurumunuz: string // 2nd person plural (sizin)
  kurumu: string // 3rd person singular possessive (onun)
  kurumlari: string // 3rd person plural possessive (onların)
}

export const INSTITUTION_MAP: Record<string, InstitutionSuffixes> = {
  mudurluk: {
    label: 'İl / İlçe Müdürlüğü',
    kurumumuz: 'Müdürlüğümüz',
    kurumunuz: 'Müdürlüğünüz',
    kurumu: 'Müdürlüğü',
    kurumlari: 'Müdürlükleri'
  },
  bakanlik: {
    label: 'Bakanlık',
    kurumumuz: 'Bakanlığımız',
    kurumunuz: 'Bakanlığınız',
    kurumu: 'Bakanlığı',
    kurumlari: 'Bakanlıkları'
  },
  valilik: {
    label: 'Valilik',
    kurumumuz: 'Valiliğimiz',
    kurumunuz: 'Valiliğiniz',
    kurumu: 'Valiliği',
    kurumlari: 'Valilikleri'
  },
  kaymakamlik: {
    label: 'Kaymakamlık',
    kurumumuz: 'Kaymakamlığımız',
    kurumunuz: 'Kaymakamlığınız',
    kurumu: 'Kaymakamlığı',
    kurumlari: 'Kaymakamlıkları'
  },
  universite: {
    label: 'Üniversite',
    kurumumuz: 'Üniversitemiz',
    kurumunuz: 'Üniversiteniz',
    kurumu: 'Üniversitesi',
    kurumlari: 'Üniversiteleri'
  },
  belediye: {
    label: 'Belediye',
    kurumumuz: 'Belediyemiz',
    kurumunuz: 'Belediyeniz',
    kurumu: 'Belediyesi',
    kurumlari: 'Belediyeleri'
  },
  il_ozel: {
    label: 'İl Özel İdresi',
    kurumumuz: 'İl Özel İdaremiz',
    kurumunuz: 'İl Özel İdareniz',
    kurumu: 'İl Özel İdaresi',
    kurumlari: 'İl Özel İdareleri'
  },
  koy: {
    label: 'Köy Muhtarlığı',
    kurumumuz: 'Muhtarlığımız',
    kurumunuz: 'Muhtarlığınız',
    kurumu: 'Muhtarlığı',
    kurumlari: 'Muhtarlıkları'
  },
  sgk: {
    label: 'Sosyal Güvenlik İl Müdürlüğü',
    kurumumuz: 'Müdürlüğümüz',
    kurumunuz: 'Müdürlüğünüz',
    kurumu: 'Müdürlüğü',
    kurumlari: 'Müdürlükleri'
  },
  kurul: {
    label: 'Kurul / Kurum',
    kurumumuz: 'Kurulumuz',
    kurumunuz: 'Kurulunuz',
    kurumu: 'Kurulu',
    kurumlari: 'Kurulları'
  },
  diger: {
    label: 'Diğer',
    kurumumuz: 'Kurumumuz',
    kurumunuz: 'Kurumunuz',
    kurumu: 'Kurumu',
    kurumlari: 'Kurumları'
  }
}

export function getSubInstitutionOptions(instType: string, finKodu: string): SubInstOption[] {
  let keys: string[] = ['diger']
  if (instType === 'genel_butce' || finKodu === '1') {
    keys = ['mudurluk', 'bakanlik', 'valilik', 'kaymakamlik', 'diger']
  } else if (instType === 'ozel_butce' || finKodu === '2') {
    keys = ['universite', 'diger']
  } else if (instType === 'belediye' || finKodu === '5') {
    keys = ['belediye', 'il_ozel', 'koy', 'diger']
  } else if (instType === 'duzenleyici' || finKodu === '3') {
    keys = ['kurul', 'diger']
  } else if (instType === 'sosyal_guvenlik' || finKodu === '4') {
    keys = ['sgk', 'diger']
  }

  return keys.map((key) => {
    const item = INSTITUTION_MAP[key] || INSTITUTION_MAP.diger
    return {
      value: key,
      label: `${item.label} (Şablonlarda: "${item.kurumumuz}")`
    }
  })
}

export function getInstitutionSuffixes(
  subInstType: string,
  customSuffixes?: Partial<InstitutionSuffixes>
): InstitutionSuffixes {
  const base = INSTITUTION_MAP[subInstType] || INSTITUTION_MAP.diger
  if (subInstType === 'diger' && customSuffixes) {
    return {
      label: customSuffixes.label || base.label,
      kurumumuz: customSuffixes.kurumumuz || base.kurumumuz,
      kurumunuz: customSuffixes.kurumunuz || base.kurumunuz,
      kurumu: customSuffixes.kurumu || base.kurumu,
      kurumlari: customSuffixes.kurumlari || base.kurumlari
    }
  }
  return base
}

export function getKurumumuzText(
  _instType: string,
  _finKodu: string,
  subInstType: string,
  customKurumumuz?: string
): string {
  if (subInstType === 'diger' && customKurumumuz) {
    return customKurumumuz
  }
  const item = INSTITUTION_MAP[subInstType] || INSTITUTION_MAP.diger
  return item.kurumumuz
}
