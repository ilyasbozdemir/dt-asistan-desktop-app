export const TANIM_Sablon = {
  name: 'TANIM_Sablon',
  description: 'Şablon dosyalarının ana tablosu',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'ad', type: 'TEXT', notNull: true },
    { name: 'dosya_adi', type: 'TEXT', notNull: true },
    { name: 'dosya_turu', type: 'TEXT', notNull: true },
    { name: 'icerik', type: 'BLOB', notNull: true },
    { name: 'aciklama', type: 'TEXT' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1 },
    { name: 'parent_id', type: 'INTEGER' },
    { name: 'versiyon', type: 'INTEGER', default: 1 },
    { name: 'kategori', type: 'TEXT' },
    { name: 'test_verisi', type: 'TEXT' },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  constraints: [
    "CHECK(dosya_turu IN ('xlsx', 'docx', 'html'))",
    "FOREIGN KEY(parent_id) REFERENCES TANIM_Sablon(id) ON DELETE SET NULL"
  ],
  initialData: []
}
