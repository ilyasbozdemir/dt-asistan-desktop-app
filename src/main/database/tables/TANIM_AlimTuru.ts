export const TANIM_AlimTuru = {
  name: 'TANIM_AlimTuru',
  description: 'Alım Türleri ve Şablon Bağlantıları',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'tur_adi', type: 'TEXT', notNull: true, description: 'Tur Adi' },
    { name: 'ikon', type: 'TEXT', description: 'Ikon' },
    { name: 'belgeler', type: 'TEXT', description: 'Belgeler' },
    { name: 'sablon_id', type: 'TEXT', description: 'Sablon ID' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1, description: 'Aktif mı?' },
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
  constraints: ['UNIQUE(tur_adi)'],
  initialData: [
    {
      tur_adi: 'Mal Alımı',
      ikon: 'Building2',
      belgeler: JSON.stringify([
        'Onay Belgesi',
        'Piyasa Fiyat Araştırması Tutanağı',
        'Muayene Kabul ve Tespit Komisyonu Tutanağı',
        'Fatura / e-Arşiv Fatura',
        'Taşınır İşlem Fişi (TİF)'
      ]),
      sablon_id: ''
    },
    {
      tur_adi: 'Hizmet Alımı',
      ikon: 'Briefcase',
      belgeler: JSON.stringify([
        'Onay Belgesi',
        'Piyasa Fiyat Araştırması Tutanağı',
        'Hizmet İşleri Kabul Tutanağı',
        'Fatura / e-Arşiv Fatura'
      ]),
      sablon_id: ''
    },
    {
      tur_adi: 'Yapım İşi',
      ikon: 'HardHat',
      belgeler: JSON.stringify([
        'Yaklaşık Maliyet Hesap Cetveli',
        'Onay Belgesi',
        'Piyasa Fiyat Araştırması Tutanağı',
        'Yapım İşleri Kabul Tutanağı',
        'Sözleşme (İdare Gerekli Görürse)'
      ]),
      sablon_id: ''
    }
  ]
}
