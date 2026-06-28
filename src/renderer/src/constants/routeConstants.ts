export const APP_ROUTES = {
  // Main
  DASHBOARD: '/',
  
  // Dosyalar
  DOSYALAR: '/dosyalar',
  YENI_DOSYA: '/dosyalar/yeni',
  DOSYA_DETAY: '/dosya',
  CIKTI_MERKEZI_DASHBOARD: '/cikti-merkezi',
  
  // Modüller
  FIRMALAR: '/firmalar',
  PERSONEL: '/personel',
  SABLONLAR: '/sablonlar',
  DEGISKENLER: '/degiskenler',
  KOMISYONLAR: '/komisyonlar',
  KOMISYON_DETAY: '/komisyonlar/detay',
  KOMISYON_GOREVLERI: '/komisyon-gorevleri',
  TAKIP: '/takip',
  TASLAK_YONETIM: '/taslakyonetim',
  RAPORLAR: '/raporlar',
  OKAS_KOD: '/okaskod',
  MEVZUAT: '/mevzuat',
  CHANGELOG: '/changelog',
  YARDIM: '/yardim',
  IMPORT: '/import',
  AYARLAR: '/ayarlar',
  TEMA: '/tema',
  BIRIMLER: '/birimler',
  AMBAR: '/ambar',
  MALZEMELER: '/malzemeler',
  YENI_MALZEME: '/malzemeler/yeni',
  TASINIR_KOD: '/tasinirkod',
  OLCU_BIRIMLERI: '/olcubirimleri',
  KURUM: '/kurum',
  PROFIL: '/profil',

  // Dosya Alt Süreçleri (SubScreens)
  // 1. Komisyon
  KOMISYON_FIYAT_ARASTIRMA: '/dosya/komisyon/fiyat-arastirma',
  KOMISYON_MUAYENE_KABUL: '/dosya/komisyon/muayene-kabul',
  KOMISYON_FIYAT_MUAYENE: '/dosya/komisyon/fiyat-muayene',
  KOMISYON_ONAY_EKI: '/dosya/komisyon/onay-eki',
  
  // 2. Malzemeler
  MALZEME_LISTESI: '/dosya/malzemeler/liste',
  
  // 3. Lüzum
  LUZUM_TALEP_FORMU: '/dosya/luzum/talep-formu',
  LUZUM_BELGESI: '/dosya/luzum/belge',
  LUZUM_ONAY_EKI: '/dosya/luzum/onay-eki',
  LUZUM_TESLIM_TESELLUM: '/dosya/luzum/teslim-tesellum',
  
  // 4. Firmalar & Maliyet
  ISTEKLI_FIRMALAR: '/dosya/firmalar-maliyet/istekliler',
  YAKLASIK_MALIYET: '/dosya/firmalar-maliyet/yaklasik',
  PIYASA_ARASTIRMA_TUTANAGI: '/dosya/firmalar-maliyet/tutanak',
  
  // 5. Onay
  DT_ONAY: '/dosya/onay/dt-onay',
  IHALE_ONAY: '/dosya/onay/ihale-onay',
  BUTCE_SORGU: '/dosya/onay/butce-sorgu',
  
  // 6. Harcama
  HARCAMA_TALIMATI: '/dosya/harcama/talimat',
  HARCAMA_PUSULASI: '/dosya/harcama/pusula',
  
  DOSYA_CIKTI_MERKEZI: '/dosya/cikti-merkezi'
} as const;

export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];
