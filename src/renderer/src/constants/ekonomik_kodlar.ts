// 1. Ekonomik Kodlar (ödeme emrinde kullanılır)
export const EKONOMIK_KODLAR = [
  { kod: '03.2.1', aciklama: 'Kırtasiye ve Büro Malzemesi Alımları', seviye: 3 }
]

// 2. Muhasebe/Taşınır Kodları (taşınır kaydında kullanılır)
export const MUHASEBE_KODLAR = [
  { kod: '150.01.01', aciklama: 'Kırtasiye Malzemeleri', hesapAdi: 'İlk Madde ve Malzeme' }
]

// 3. Eşleştirme (ikisini bağlar)
export const KOD_ESLESTIRME = [
  { ekonomikKod: '03.2.1', muhasebeKod: '150.01.01' },
  { ekonomikKod: '06.1.2', muhasebeKod: '255.01.01' }
]
