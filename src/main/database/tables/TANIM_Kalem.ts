export const TANIM_Kalem = {
  name: 'TANIM_Kalem',
  description: 'Ortak malzeme, hizmet ve yapım işleri havuzu',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'eski_id', type: 'TEXT', description: 'Eski ID' },
    { name: 'barkod_id', type: 'TEXT', unique: true, notNull: true, description: 'Barkod ID' },
    { name: 'tasinir_kodu', type: 'TEXT', description: 'Tasinir Kodu' },
    { name: 'okas_kodu', type: 'TEXT', description: 'Okas Kodu' },
    { name: 'kalem_adi', type: 'TEXT', notNull: true, description: 'Kalem Adi' },
    { name: 'tipi', type: 'TEXT', notNull: true, default: "'Mal'", description: 'Tipi' }, // Mal, Hizmet, Personel, Hizmet, Diğer, Yapım
    { name: 'birim', type: 'TEXT', default: "'Adet'", description: 'Birim' },
    { name: 'kategori', type: 'TEXT', description: 'Kategori' },
    { name: 'ozelligi', type: 'TEXT', description: 'Ozelligi' },
    { name: 'kdv_orani', type: 'REAL', default: 20, description: 'Kdv Orani' },
    { name: 'mensei', type: 'TEXT', description: 'Mensei' }, // Yerli, Yabancı
    { name: 'is_personel', type: 'INTEGER', default: 0, description: 'Is Personel' },
    {
      name: 'personel_asgari_fark_oran',
      type: 'REAL',
      default: 0,
      description: 'Personel Asgari Fark Oran'
    },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1, description: 'Aktif mı?' },
    { name: 'notlar', type: 'TEXT', description: 'Notlar' },
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
  initialData: []
}
