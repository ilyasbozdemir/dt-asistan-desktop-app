export const TANIM_Komisyon = {
  name: 'TANIM_Komisyon',
  description: 'Kullanıcı tarafından oluşturulan bağımsız komisyonlar',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'ad', type: 'TEXT', notNull: true }, // Örn: Fiyat Araştırma Komisyonu
    { name: 'aciklama', type: 'TEXT' },
    { name: 'aktif_mi', type: 'BOOLEAN', default: 1 },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  constraints: [
    'UNIQUE(ad)'
  ],
  initialData: [
    { ad: 'Fiyat Araştırma Komisyonu' },
    { ad: 'Yaklaşık Maliyet Tespit Komisyonu' },
    { ad: 'Muayene Kabul ve Tespit Komisyonu' }
  ]
}
