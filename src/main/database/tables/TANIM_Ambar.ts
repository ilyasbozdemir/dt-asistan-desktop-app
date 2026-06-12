export const TANIM_Ambar = {
  name: 'TANIM_Ambar',
  description: 'Kurum ambar depoları ve stok yönetimi',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'eski_id', type: 'TEXT' },
    { name: 'ambar_adi', type: 'TEXT', notNull: true, unique: true },
    { name: 'aciklama', type: 'TEXT' },
    { name: 'adres', type: 'TEXT' },
    { name: 'semt', type: 'TEXT' },
    { name: 'posta_kodu', type: 'TEXT' },
    { name: 'sehir', type: 'TEXT' },
    { name: 'telefon', type: 'TEXT' },
    { name: 'faks', type: 'TEXT' },
    { name: 'web_adresi', type: 'TEXT' },
    { name: 'email', type: 'TEXT' },
    { name: 'tasinir_kodu', type: 'TEXT' },
    { name: 'tasinir_adi', type: 'TEXT' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1 },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  initialData: []
}
