export const TANIM_KikLimitDonemleri = {
  name: 'TANIM_KikLimitDonemleri',
  description: 'KİK Madde 22/d Doğrudan Temin parasal limitlerinin dönemsel olarak tutulduğu tablo',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'donem_kodu', type: 'TEXT', notNull: true, unique: true, description: 'Donem Kodu' },
    { name: 'baslangic_tarihi', type: 'TEXT', notNull: true, description: 'Baslangic Tarihi' },
    { name: 'bitis_tarihi', type: 'TEXT', notNull: true, description: 'Bitis Tarihi' },
    { name: 'buyuksehir_limit', type: 'REAL', notNull: true, description: 'Buyuksehir Limit' },
    { name: 'diger_limit', type: 'REAL', notNull: true, description: 'Diger Limit' },
    { name: 'guncelleme_orani', type: 'TEXT', description: 'Guncelleme Orani' },
    { name: 'kaynak', type: 'TEXT', description: 'Kaynak' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Created At'
    },
    {
      name: 'updated_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Updated At'
    }
  ],
  initialData: [
    {
      donem_kodu: '2026',
      baslangic_tarihi: '2026-02-01',
      bitis_tarihi: '2027-01-31',
      buyuksehir_limit: 1021827.0,
      diger_limit: 340391.0,
      guncelleme_orani: '%43.93',
      kaynak: 'Sistem Kurulumu'
    }
  ]
}
