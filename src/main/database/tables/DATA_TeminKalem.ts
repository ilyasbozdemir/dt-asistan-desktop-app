export const DATA_TeminKalem = {
  name: 'DATA_TeminKalem',
  description: 'Dosyaya bağlı malzeme, hizmet veya yapım işi kalemleri',
  columns: [
    {
      name: 'id',
      type: 'INTEGER',
      primaryKey: true,
      autoIncrement: true,
      description: 'Sıra / ID'
    },
    {
      name: 'temin_dosya_id',
      type: 'INTEGER',
      notNull: true,
      description: 'Bağlı Olduğu Dosya ID'
    },
    { name: 'barkod_id', type: 'TEXT', description: 'Barkod ID' },
    { name: 'tasinir_kodu', type: 'TEXT', description: 'Taşınır Kodu' },
    { name: 'okas_kodu', type: 'TEXT', description: 'OKAS Kodu' },
    { name: 'kalem_adi', type: 'TEXT', notNull: true, description: 'Malzeme / Hizmet / İş Adı' },
    {
      name: 'tipi',
      type: 'TEXT',
      notNull: true,
      default: "'Mal'",
      description: 'Alım Tipi (Mal/Hizmet/Yapım/Danışmanlık)'
    }, // Mal | Hizmet | Yapım | Danışmanlık
    {
      name: 'birim',
      type: 'TEXT',
      default: "'Adet'",
      description: 'Ölçü Birimi (Adet, Kg, Lt vb.)'
    },
    { name: 'miktar', type: 'REAL', notNull: true, default: 1, description: 'Miktar' },
    { name: 'kdv_orani', type: 'REAL', default: 20, description: 'KDV Oranı (%)' },
    { name: 'aciklama', type: 'TEXT', description: 'Kalem Açıklaması' },
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
  constraints: ['FOREIGN KEY(temin_dosya_id) REFERENCES DATA_TeminDosyasi(id) ON DELETE CASCADE'],
  initialData: []
}
