export const TANIM_AlimTuru = {
  name: 'TANIM_AlimTuru',
  description: 'Alım Türleri ve Şablon Bağlantıları',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'tur_adi', type: 'TEXT', notNull: true },
    { name: 'ikon', type: 'TEXT' },
    { name: 'belgeler', type: 'TEXT' },
    { name: 'sablon_id', type: 'TEXT' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1 },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  initialData: [
    {
      tur_adi: 'Mal Alımı',
      ikon: 'Building2',
      belgeler: JSON.stringify(['Onay Belgesi', 'Piyasa Fiyat Araştırması Tutanağı', 'Muayene Kabul ve Tespit Komisyonu Tutanağı', 'Fatura / e-Arşiv Fatura', 'Taşınır İşlem Fişi (TİF)']),
      sablon_id: ''
    },
    {
      tur_adi: 'Hizmet Alımı',
      ikon: 'Briefcase',
      belgeler: JSON.stringify(['Onay Belgesi', 'Piyasa Fiyat Araştırması Tutanağı', 'Hizmet İşleri Kabul Tutanağı', 'Fatura / e-Arşiv Fatura']),
      sablon_id: ''
    },
    {
      tur_adi: 'Yapım İşi',
      ikon: 'HardHat',
      belgeler: JSON.stringify(['Yaklaşık Maliyet Hesap Cetveli', 'Onay Belgesi', 'Piyasa Fiyat Araştırması Tutanağı', 'Yapım İşleri Kabul Tutanağı', 'Sözleşme (İdare Gerekli Görürse)']),
      sablon_id: ''
    }
  ]
}
