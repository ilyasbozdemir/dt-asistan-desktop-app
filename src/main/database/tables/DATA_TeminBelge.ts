export const DATA_TeminBelge = {
  name: 'DATA_TeminBelge',
  description: 'Dosya kapsamında üretilen belgelerin log/geçmiş kaydı',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'temin_dosya_id', type: 'INTEGER', notNull: true },
    { name: 'belge_adi', type: 'TEXT', notNull: true },
    { name: 'sablon_id', type: 'INTEGER' },
    { name: 'dosya_yolu', type: 'TEXT' },
    { name: 'is_signed', type: 'INTEGER', default: 0 },
    { name: 'imzali_dosya_yolu', type: 'TEXT' },
    { name: 'olusturan_personel_id', type: 'INTEGER' },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  constraints: [
    'FOREIGN KEY(temin_dosya_id) REFERENCES DATA_TeminDosyasi(id) ON DELETE CASCADE'
  ],
  initialData: []
}
