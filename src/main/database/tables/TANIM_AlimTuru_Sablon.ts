export const TANIM_AlimTuru_Sablon = {
  name: 'TANIM_AlimTuru_Sablon',
  description: 'Alım türüne göre hangi şablonların kullanılacağı',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'alim_turu_id', type: 'INTEGER', notNull: true, description: 'Alim Turu ID' },
    { name: 'belge_adi', type: 'TEXT', notNull: true, description: 'Belge Adi' },
    { name: 'sablon_id', type: 'INTEGER', description: 'Sablon ID' },
    { name: 'sira', type: 'INTEGER', notNull: true, default: 0, description: 'Sira' },
    { name: 'zorunlu', type: 'INTEGER', notNull: true, default: 1, description: 'Zorunlu' }
  ],
  constraints: [
    'FOREIGN KEY(alim_turu_id) REFERENCES TANIM_AlimTuru(id) ON DELETE CASCADE',
    'FOREIGN KEY(sablon_id) REFERENCES TANIM_Sablon(id) ON DELETE RESTRICT',
    'UNIQUE(alim_turu_id, belge_adi)'
  ],
  initialData: []
}
