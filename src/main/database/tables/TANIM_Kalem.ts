export const TANIM_Kalem = {
  name: 'TANIM_Kalem',
  description: 'Ortak malzeme, hizmet ve yapım işleri havuzu',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'barkod_id', type: 'TEXT', unique: true, notNull: true },
    { name: 'tasinir_kodu', type: 'TEXT' },
    { name: 'kalem_adi', type: 'TEXT', notNull: true },
    { name: 'tipi', type: 'TEXT', notNull: true, default: "'Mal Alımı'" }, // Mal Alımı, Hizmet Alımı, Yapım İşi
    { name: 'birim', type: 'TEXT', default: "'Adet'" },
    { name: 'kategori', type: 'TEXT' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1 },
    { name: 'notlar', type: 'TEXT' },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  initialData: []
}
