export enum DTVTKodu {
  // Merkezi Yönetim
  GENEL_BUTCE = 1,
  OZEL_BUTCE = 2,
  DUZENLEYICI_DENETLEYICI = 3,
  SOSYAL_GUVENLIK = 4,

  // Mahalli İdareler
  IL_OZEL_IDARESI = 5,
  BELEDIYE = 6,
  BUYUKSEHIR_BELEDIYE = 7,
  MAHALLE_MUHTARLIGI = 8,
  KOYKENT = 9,

  // Diğer
  DONER_SERMAYE = 10,
  BAGLI_KURULUS = 11,
  FON = 12,
  KIT = 13
}

export const DTVTKoduLabels: Record<number, string> = {
  [DTVTKodu.GENEL_BUTCE]: 'Genel Bütçe',
  [DTVTKodu.OZEL_BUTCE]: 'Özel Bütçe',
  [DTVTKodu.DUZENLEYICI_DENETLEYICI]: 'Düzenleyici ve Denetleyici Kurumlar',
  [DTVTKodu.SOSYAL_GUVENLIK]: 'Sosyal Güvenlik Kurumları',
  [DTVTKodu.IL_OZEL_IDARESI]: 'İl Özel İdaresi',
  [DTVTKodu.BELEDIYE]: 'Belediye',
  [DTVTKodu.BUYUKSEHIR_BELEDIYE]: 'Büyükşehir Belediyesi',
  [DTVTKodu.MAHALLE_MUHTARLIGI]: 'Mahalle Muhtarlığı',
  [DTVTKodu.KOYKENT]: 'Köykent',
  [DTVTKodu.DONER_SERMAYE]: 'Döner Sermaye İşletmeleri',
  [DTVTKodu.BAGLI_KURULUS]: 'Bağlı Kuruluş',
  [DTVTKodu.FON]: 'Fon',
  [DTVTKodu.KIT]: 'Kamu İktisadi Teşebbüsü (KİT)'
}
