export const TANIM_Ambar = {
  name: 'TANIM_Ambar',
  description: 'Kurum ambar depoları ve stok yönetimi',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'eski_id', type: 'TEXT', description: 'Eski ID' },
    { name: 'ambar_adi', type: 'TEXT', notNull: true, unique: true, description: 'Ambar Adi' },
    { name: 'aciklama', type: 'TEXT', description: 'Aciklama' },
    { name: 'adres', type: 'TEXT', description: 'Adres' },
    { name: 'semt', type: 'TEXT', description: 'Semt' },
    { name: 'posta_kodu', type: 'TEXT', description: 'Posta Kodu' },
    { name: 'sehir', type: 'TEXT', description: 'Sehir' },
    { name: 'telefon', type: 'TEXT', description: 'Telefon' },
    { name: 'faks', type: 'TEXT', description: 'Faks' },
    { name: 'web_adresi', type: 'TEXT', description: 'Web Adresi' },
    { name: 'email', type: 'TEXT', description: 'Email' },
    { name: 'tasinir_kodu', type: 'TEXT', description: 'Tasinir Kodu' },
    { name: 'tasinir_adi', type: 'TEXT', description: 'Tasinir Adi' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1, description: 'Aktif mı?' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Created At'
    }
  ],
  initialData: []
}
