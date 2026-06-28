export interface ButceKoduRehberItem {
  id: string
  baslik: string
  aciklama: string
  maddeler: string[]
  not: string
}

export const BUTCE_KODU_REHBERI: ButceKoduRehberItem[] = [
  {
    id: 'kurumsal',
    baslik: 'Kurumsal Kod (Kurum ve Birim Bilgisi)',
    aciklama:
      'Harcamayı yapan idari birimi gösterir. Genellikle 4 düzeyden oluşur (Örn: 46.00.00.01).',
    maddeler: [
      'Düzey 1: Kurum Tipi (Örn: 30 - Mahalli İdareler)',
      'Düzey 2: İl/Bölge (Örn: XX - X İli)',
      'Düzey 3: İlçe/Kurum (Örn: 01 - Merkez)',
      'Düzey 4: Harcama Birimi / Müdürlük (Örn: 22 - Mali Hizmetler Müdürlüğü)'
    ],
    not: "Sistemde 'Ayarlar > Kurum Bilgileri' alanından seçilerek yönetilir."
  },
  {
    id: 'fonksiyonel',
    baslik: 'Fonksiyonel Kod (Hizmetin Amacı)',
    aciklama:
      'Harcamanın hangi devlet fonksiyonunu (eğitim, sağlık, genel yönetim vb.) yerine getirmek için yapıldığını gösterir. 4 düzeyden oluşur (Örn: 01.1.2.00).',
    maddeler: [
      'Düzey 1: Ana Fonksiyon (Örn: 01 - Genel Kamu Hizmetleri)',
      'Düzey 2: Alt Fonksiyon',
      'Düzey 3 ve 4: Detay Fonksiyonlar'
    ],
    not: "Sistemde 'Ayarlar > Kurum Bilgileri' alanından seçilerek yönetilir."
  },
  {
    id: 'finansman',
    baslik: 'Finansman Kodu (Kaynağın Türü)',
    aciklama:
      'Harcamanın hangi finansman kaynağından karşılandığını gösterir. Tek düzeydir (Örn: 5).',
    maddeler: ['1: Genel Bütçeli İdareler', '2: Özel Bütçeli İdareler', '5: Mahalli İdareler'],
    not: "Sistemde Kurum Tipi'ne bağlı olarak 'Ayarlar' menüsünden otomatik belirlenir/seçilir."
  },
  {
    id: 'ekonomik',
    baslik: 'Ekonomik Kod (Harcamanın Türü)',
    aciklama:
      'Harcamanın ekonomik mahiyetini (ne satın alındığını) gösterir. 4 düzeyden oluşur (Örn: 03.2.1.01).',
    maddeler: [
      '03: Mal ve Hizmet Alım Giderleri',
      '2: Tüketime Yönelik Mal ve Malzeme Alımları',
      '1: Kırtasiye ve Büro Malzemesi Alımları',
      '01: Kırtasiye Alımları'
    ],
    not: "Sistemde 'Mevzuat ve Parametreler' kısmındaki sözlükten yönetilir ve ihale/alım sürecinde dosyaya eklenen kalemlere göre belirlenir."
  },
  {
    id: 'tasinir',
    baslik: 'Mal Alımlarında Taşınır ve Muhasebe Hesap Kodları',
    aciklama:
      'Mal alımlarında, bütçeden çıkan parayı göstermek için Ekonomik Kod kullanılırken; alınan malın ambar/depo kaydı (TİF) ve bilançoya işlenmesi için Muhasebe Hesap Kodu (Taşınır Kodu) devreye girer. Bu kodlar 5 düzeye kadar inebilir.',
    maddeler: [
      'Düzey 1 (Hesap): 150 - İlk Madde ve Malzemeler',
      'Düzey 2 (1. Derece Detay): 01 - Kırtasiye Malzemeleri',
      'Düzey 3 (2. Derece Detay): 01 - Yazı Araçları',
      'Düzey 4 ve 5: Kalemin daha spesifik cinsi ve çeşidi (Örn: 150.01.01.01.01)'
    ],
    not: 'Mal alım dosyalarında, Bütçe Ekonomik Kodu ile Taşınır/Muhasebe Kodu birbirine entegre çalışır.'
  }
]

export const BUTCE_KODU_GENEL_BILGI = `Uygulama, evrak (ÖEB, Onay Belgesi) üretirken;
Kurumsal Kod, Fonksiyonel Kod, Finansman Kodu ve Ekonomik Kodu yan yana getirerek tam bütçe kodunu (Tertip) oluşturur.

Örnek Tam Bütçe Tertibi: 46.00.00.01 - 01.1.2.00 - 5 - 03.2.1.01
(X Belediyesi Mali Hizmetler Müdürlüğü - Finansal Hizmetler - Mahalli İdare Bütçesi - Kırtasiye Alımı)`
