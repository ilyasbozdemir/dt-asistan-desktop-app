export const TANIM_Kalem = {
  name: 'TANIM_Kalem',
  description: 'Ortak malzeme, hizmet ve yapım işleri havuzu',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'eski_id', type: 'TEXT' },
    { name: 'barkod_id', type: 'TEXT', unique: true, notNull: true },
    { name: 'tasinir_kodu', type: 'TEXT' },
    { name: 'okas_kodu', type: 'TEXT' },
    { name: 'kalem_adi', type: 'TEXT', notNull: true },
    { name: 'tipi', type: 'TEXT', notNull: true, default: "'Mal'" }, // Mal, Hizmet, Personel, Hizmet, Diğer, Yapım
    { name: 'birim', type: 'TEXT', default: "'Adet'" },
    { name: 'kategori', type: 'TEXT' },
    { name: 'ozelligi', type: 'TEXT' },
    { name: 'kdv_orani', type: 'REAL', default: 20 },
    { name: 'mensei', type: 'TEXT' }, // Yerli, Yabancı
    { name: 'is_personel', type: 'INTEGER', default: 0 },
    { name: 'personel_asgari_fark_oran', type: 'REAL', default: 0 },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1 },
    { name: 'notlar', type: 'TEXT' },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  initialData: []
}
