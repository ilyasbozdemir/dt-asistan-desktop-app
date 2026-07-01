export const DATA_DosyaSablonVeri = {
  name: 'DATA_DosyaSablonVeri',
  description: 'Her şablon ve dosya için alınan belge anlık görüntüsü (snapshot) verilerini tutar',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'temin_dosya_id', type: 'INTEGER', notNull: true, description: 'Temin Dosyası ID' },
    { name: 'sablon_id', type: 'INTEGER', notNull: true, description: 'Şablon ID' },
    { name: 'veri_json', type: 'TEXT', notNull: true, description: 'Anlık Görüntü JSON verisi' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Oluşturulma Tarihi'
    },
    {
      name: 'updated_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Güncellenme Tarihi'
    }
  ],
  constraints: [
    'FOREIGN KEY(temin_dosya_id) REFERENCES DATA_TeminDosyasi(id) ON DELETE CASCADE',
    'FOREIGN KEY(sablon_id) REFERENCES TANIM_Sablon(id) ON DELETE CASCADE',
    'UNIQUE(temin_dosya_id, sablon_id)'
  ],
  initialData: []
}
